/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as path from 'path';
import * as fs from 'fs';
import * as vscode from 'vscode';

export class PSBuildTaskProvider implements vscode.TaskProvider {
    static PSBuildType = 'PSBuild';
    private PSBuildPromise: Thenable<vscode.Task[]> | undefined = undefined;

    constructor(workspaceRoot: string) {
        const pattern = path.join(workspaceRoot, 'psconfig.psd1');
        const fileWatcher = vscode.workspace.createFileSystemWatcher(pattern);
        fileWatcher.onDidChange(() => this.PSBuildPromise = undefined);
        fileWatcher.onDidCreate(() => this.PSBuildPromise = undefined);
        fileWatcher.onDidDelete(() => this.PSBuildPromise = undefined);
    }

    public provideTasks(): Thenable<vscode.Task[]> | undefined {
        if (!this.PSBuildPromise) {
            this.PSBuildPromise = getPSBuildTasks();
        }
        return this.PSBuildPromise;
    }

    public resolveTask(_task: vscode.Task): vscode.Task | undefined {
        const task = _task.definition.task;
        // A PSBuild task consists of a task and an optional file as specified in PSBuildTaskDefinition
        // Make sure that this looks like a PSBuild task by checking that there is a task.
        if (task) {
            // resolveTask requires that the same definition object be used.
            const definition: PSBuildTaskDefinition = <any>_task.definition;
            return new vscode.Task(definition, _task.scope ?? vscode.TaskScope.Workspace, definition.task, 'PSBuild', new vscode.ShellExecution(`Invoke-RSMBuild -Task ${definition.task}`),'$pester');
        }
        return undefined;
    }
}

function exists(file: string): Promise<boolean> {
    return new Promise<boolean>((resolve, _reject) => {
        fs.exists(file, (value) => {
            resolve(value);
        });
    });
}

interface PSBuildTaskDefinition extends vscode.TaskDefinition {
    /**
     * The task name
     */
    task: string;

    /**
     * The PSBuild file containing the task
     */
    file?: string;
}

const buildNames: string[] = ['build', 'clean'];
function isBuildTask(name: string): boolean {
    for (const buildName of buildNames) {
        if (name.indexOf(buildName) !== -1) {
            return true;
        }
    }
    return false;
}

const testNames: string[] = ['test'];
function isTestTask(name: string): boolean {
    for (const testName of testNames) {
        if (name.indexOf(testName) !== -1) {
            return true;
        }
    }
    return false;
}

async function getPSBuildTasks(): Promise<vscode.Task[]> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    const result: vscode.Task[] = [];
    if (!workspaceFolders || workspaceFolders.length === 0) {
        return result;
    }
    for (const workspaceFolder of workspaceFolders) {
        const folderString = workspaceFolder.uri.fsPath;
        if (!folderString) {
            continue;
        }
        const PSBuildFile = path.join(folderString, 'psconfig.psd1');
        if (!await exists(PSBuildFile)) {
            continue;
        }

        let possibleTasks = [];
        possibleTasks.push(...buildNames);
        possibleTasks.push(...testNames);

        for (const taskName of possibleTasks) {
            const kind: PSBuildTaskDefinition = {
                type: 'PSBuild',
                task: taskName
            };
            const task = new vscode.Task(kind, workspaceFolder, taskName, 'PSBuild', new vscode.ShellExecution(`Invoke-RSMBuild -Task ${taskName}`),'$pester');
            result.push(task);
            if (isBuildTask(taskName)) {
                task.group = vscode.TaskGroup.Build;
            } else if (isTestTask(taskName)) {
                task.group = vscode.TaskGroup.Test;
            }
        }
    }
    return result;
}
