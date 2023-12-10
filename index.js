"use strict";
class TextEditor {
    #enteredText = [];
    // стек команд редактора сохраняет все команды, включая предыдущий и следующий шаг
    #commandStack = [];
    #temporaryMaximumIndex = null;
    #indexCommandStack = null;
    get viewText() {
        return `view text - ${this.#enteredText.join('')}`;
    }
    #indexCommandStackUp() {
        if (this.#indexCommandStack !== null) {
            ++this.#indexCommandStack;
        }
    }
    #indexCommandStackDown() {
        if (this.#indexCommandStack !== null) {
            --this.#indexCommandStack;
        }
    }
    insertText(position, insertText) {
        this.#enteredText.splice(position, 0, insertText);
        this.#commandStack.push([EOperation.Insert, position, insertText]);
        this.#indexCommandStack = null;
        this.#temporaryMaximumIndex = null;
        console.log(`insert text - ${insertText} - "${this.#enteredText.join('')}"`);
    }
    deleteText(position, removeAmountText) {
        const returnText = this.#enteredText.splice(position, removeAmountText);
        this.#commandStack.push([EOperation.Delete, position, returnText.join('')]);
        this.#indexCommandStack = null;
        this.#temporaryMaximumIndex = null;
        console.log(`delete text - ${returnText.join('')} - "${this.#enteredText.join('')}"`);
    }
    viewStackCommands() {
        console.log('stack of all commands');
        this.#commandStack.forEach(item => {
            console.log(`command - ${item[0]}, position - ${item[1]}, text - ${item[2]}`);
        });
    }
    previousOperation() {
        if (this.#temporaryMaximumIndex === null) {
            this.#temporaryMaximumIndex = this.#commandStack.length - 1;
        }
        if (this.#indexCommandStack === null) {
            this.#indexCommandStack = this.#commandStack.length - 1;
        }
        if (this.#indexCommandStack >= 0) {
            const element = this.#commandStack[this.#indexCommandStack];
            if (Array.isArray(element)) {
                const position = element[1];
                switch (element[0]) {
                    case EOperation.Insert:
                        const removeAmountText = element[2].length;
                        const text = this.#enteredText.splice(position, removeAmountText);
                        this.#commandStack.push([EOperation.Delete, position, text.join('')]);
                        this.#indexCommandStackDown();
                        console.log(`previous operation - "${this.#enteredText.join('')}"`);
                        break;
                    case EOperation.Delete:
                        const insertText = element[2];
                        this.#enteredText.splice(position, 0, insertText);
                        this.#commandStack.push([EOperation.Insert, position, insertText]);
                        this.#indexCommandStackDown();
                        console.log(`previous operation - "${this.#enteredText.join('')}"`);
                        break;
                }
            }
        }
    }
    nextOperation() {
        if (this.#temporaryMaximumIndex === null) {
            this.#temporaryMaximumIndex = this.#commandStack.length - 1;
        }
        if (this.#indexCommandStack !== null) {
            if (this.#indexCommandStack < this.#temporaryMaximumIndex) {
                this.#indexCommandStackUp();
                const element = this.#commandStack[this.#indexCommandStack];
                if (Array.isArray(element)) {
                    const position = element[1];
                    switch (element[0]) {
                        case EOperation.Insert:
                            const insertText = element[2];
                            this.#enteredText.splice(position, 0, insertText);
                            this.#commandStack.push([EOperation.Insert, position, insertText]);
                            console.log(`next operation - "${this.#enteredText.join('')}"`);
                            break;
                        case EOperation.Delete:
                            const removeAmountText = element[2].length;
                            const text = this.#enteredText.splice(position, removeAmountText);
                            this.#commandStack.push([EOperation.Delete, position, text.join('')]);
                            console.log(`next operation - "${this.#enteredText.join('')}"`);
                            break;
                    }
                }
            }
        }
    }
}
class Command {
    textEditor;
    constructor(textEditor) {
        this.textEditor = textEditor;
    }
}
class InsertCommand extends Command {
    execute = (position, insertText) => {
        this.textEditor.insertText(position, insertText);
    };
}
class DeleteCommand extends Command {
    execute = (position, removeAmountText) => {
        this.textEditor.deleteText(position, removeAmountText);
    };
}
class ViewCommand extends Command {
    execute = () => this.textEditor.viewText;
}
class ViewStackCommands extends Command {
    execute = () => {
        this.textEditor.viewStackCommands();
    };
}
class PreviousCommand extends Command {
    execute = () => {
        this.textEditor.previousOperation();
    };
}
class NextCommand extends Command {
    execute = () => {
        this.textEditor.nextOperation();
    };
}
function isInsertCommand(type) {
    return type instanceof InsertCommand;
}
function isDeleteCommand(type) {
    return type instanceof DeleteCommand;
}
function isViewCommand(type) {
    return type instanceof ViewCommand;
}
function isViewStackCommands(type) {
    return type instanceof ViewStackCommands;
}
function isPreviousCommand(type) {
    return type instanceof PreviousCommand;
}
function isNextCommand(type) {
    return type instanceof NextCommand;
}
var EOperation;
(function (EOperation) {
    EOperation["Insert"] = "Insert";
    EOperation["Delete"] = "Delete";
})(EOperation || (EOperation = {}));
class Invoker {
    // стек инвокера сохраняет операции над текстом (добавление или удаление текста)
    #operationStack = [];
    #indexCommandStack;
    #command;
    executeСommand(command) {
        this.#command = command;
    }
    beginСommand(position, insertOrDelete) {
        if (this.#command) {
            if (isInsertCommand(this.#command)) {
                if (position !== undefined && typeof insertOrDelete === 'string') {
                    this.#operationStack.push([EOperation.Insert, position, insertOrDelete]);
                    if (!this.#indexCommandStack) {
                        this.#indexCommandStack = 0;
                    }
                    else {
                        ++this.#indexCommandStack;
                    }
                    this.#command.execute(position, insertOrDelete);
                }
            }
            if (isDeleteCommand(this.#command)) {
                if (position && insertOrDelete) {
                    if (typeof insertOrDelete === 'number') {
                        this.#operationStack.push([EOperation.Delete, position, insertOrDelete]);
                        if (!this.#indexCommandStack) {
                            this.#indexCommandStack = 0;
                        }
                        else {
                            ++this.#indexCommandStack;
                        }
                        this.#command.execute(position, insertOrDelete);
                    }
                }
            }
            if (isViewCommand(this.#command)) {
                return this.#command.execute();
            }
            if (isPreviousCommand(this.#command)) {
                return this.#command.execute();
            }
            if (isNextCommand(this.#command)) {
                return this.#command.execute();
            }
            if (isViewStackCommands(this.#command)) {
                return this.#command.execute();
            }
        }
    }
    operationStack() {
        console.log(`operation stack`);
        console.log(this.#operationStack);
    }
}
class Client {
    #textEditor = new TextEditor();
    #viewEnteredText = new ViewCommand(this.#textEditor);
    #viewStackCommands = new ViewStackCommands(this.#textEditor);
    #addText = new InsertCommand(this.#textEditor);
    #deleteText = new DeleteCommand(this.#textEditor);
    #previousCommand = new PreviousCommand(this.#textEditor);
    #nextCommand = new NextCommand(this.#textEditor);
    #invoker = new Invoker();
    workingWithTextEditor() {
        this.#invoker.beginСommand();
        this.#invoker.executeСommand(this.#addText);
        this.#invoker.beginСommand(0, 'a');
        this.#invoker.executeСommand(this.#addText);
        this.#invoker.beginСommand(1, 'b');
        this.#invoker.executeСommand(this.#addText);
        this.#invoker.beginСommand(2, 'c');
        this.#invoker.executeСommand(this.#addText);
        this.#invoker.beginСommand(3, 'd');
        this.#invoker.executeСommand(this.#addText);
        this.#invoker.beginСommand(4, 'e');
        this.#invoker.executeСommand(this.#addText);
        this.#invoker.beginСommand(5, 'f');
        this.#invoker.executeСommand(this.#deleteText);
        this.#invoker.beginСommand(5, 1);
        console.log('___________________');
        this.#invoker.executeСommand(this.#previousCommand);
        this.#invoker.beginСommand();
        this.#invoker.executeСommand(this.#previousCommand);
        this.#invoker.beginСommand();
        this.#invoker.executeСommand(this.#previousCommand);
        this.#invoker.beginСommand();
        this.#invoker.executeСommand(this.#previousCommand);
        this.#invoker.beginСommand();
        this.#invoker.executeСommand(this.#previousCommand);
        this.#invoker.beginСommand();
        this.#invoker.executeСommand(this.#previousCommand);
        this.#invoker.beginСommand();
        this.#invoker.executeСommand(this.#previousCommand);
        this.#invoker.beginСommand();
        this.#invoker.executeСommand(this.#nextCommand);
        this.#invoker.beginСommand();
        this.#invoker.executeСommand(this.#nextCommand);
        this.#invoker.beginСommand();
        this.#invoker.executeСommand(this.#nextCommand);
        this.#invoker.beginСommand();
        this.#invoker.executeСommand(this.#nextCommand);
        this.#invoker.beginСommand();
        this.#invoker.executeСommand(this.#nextCommand);
        this.#invoker.beginСommand();
        this.#invoker.executeСommand(this.#addText);
        this.#invoker.beginСommand(5, 'm');
        this.#invoker.executeСommand(this.#addText);
        this.#invoker.beginСommand(6, 'n');
        this.#invoker.executeСommand(this.#deleteText);
        this.#invoker.beginСommand(6, 1);
        this.#invoker.executeСommand(this.#nextCommand);
        this.#invoker.beginСommand();
        this.#invoker.executeСommand(this.#previousCommand);
        this.#invoker.beginСommand();
        this.#invoker.executeСommand(this.#previousCommand);
        this.#invoker.beginСommand();
        this.#invoker.executeСommand(this.#previousCommand);
        this.#invoker.beginСommand();
        this.#invoker.executeСommand(this.#nextCommand);
        this.#invoker.beginСommand();
        this.#invoker.executeСommand(this.#nextCommand);
        this.#invoker.beginСommand();
        this.#invoker.executeСommand(this.#nextCommand);
        this.#invoker.beginСommand();
        this.#invoker.executeСommand(this.#nextCommand);
        this.#invoker.beginСommand();
        this.#invoker.executeСommand(this.#nextCommand);
        this.#invoker.beginСommand();
        this.#invoker.executeСommand(this.#previousCommand);
        this.#invoker.beginСommand();
        this.#invoker.executeСommand(this.#previousCommand);
        this.#invoker.beginСommand();
        this.#invoker.executeСommand(this.#previousCommand);
        this.#invoker.beginСommand();
        this.#invoker.executeСommand(this.#previousCommand);
        this.#invoker.beginСommand();
        this.#invoker.executeСommand(this.#previousCommand);
        this.#invoker.beginСommand();
        this.#invoker.executeСommand(this.#previousCommand);
        this.#invoker.beginСommand();
        this.#invoker.executeСommand(this.#previousCommand);
        this.#invoker.beginСommand();
        this.#invoker.executeСommand(this.#previousCommand);
        this.#invoker.beginСommand();
        this.#invoker.executeСommand(this.#previousCommand);
        this.#invoker.beginСommand();
        this.#invoker.executeСommand(this.#previousCommand);
        this.#invoker.beginСommand();
        this.#invoker.executeСommand(this.#previousCommand);
        this.#invoker.beginСommand();
        this.#invoker.executeСommand(this.#previousCommand);
        this.#invoker.beginСommand();
        this.#invoker.executeСommand(this.#previousCommand);
        this.#invoker.beginСommand();
        this.#invoker.executeСommand(this.#previousCommand);
        this.#invoker.beginСommand();
        this.#invoker.executeСommand(this.#previousCommand);
        this.#invoker.beginСommand();
        this.#invoker.executeСommand(this.#previousCommand);
        this.#invoker.beginСommand();
        this.#invoker.executeСommand(this.#previousCommand);
        this.#invoker.beginСommand();
        this.#invoker.executeСommand(this.#previousCommand);
        this.#invoker.beginСommand();
        this.#invoker.executeСommand(this.#previousCommand);
        this.#invoker.beginСommand();
        this.#invoker.executeСommand(this.#previousCommand);
        this.#invoker.beginСommand();
        this.#invoker.executeСommand(this.#previousCommand);
        this.#invoker.beginСommand();
        console.log('___________________');
        this.#invoker.executeСommand(this.#viewEnteredText);
        console.log(this.#invoker.beginСommand());
        console.log('___________________');
        this.#invoker.operationStack();
        console.log('___________________');
        this.#invoker.executeСommand(this.#viewStackCommands);
        this.#invoker.beginСommand();
    }
}
const client = new Client();
client.workingWithTextEditor();
