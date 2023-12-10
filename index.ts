type stackType = [EOperation , number , string][]

type executeInsertCommandType = (position : number , insertText : string) => void
type executeDeleteCommandType = (position : number , removeAmountText : number) => void
type executeViewCommandType = () => ITextEditor['viewText']
type executePreviousCommandType = () => void
type executeNextCommandType = () => void
type executeViewStackCommandsType = () => void
type executeType = executeInsertCommandType 
                                    | executeDeleteCommandType 
                                    | executeViewCommandType
                                    | executePreviousCommandType
                                    | executeNextCommandType
                                    | executeViewStackCommandsType

interface ITextEditor {
    readonly insertText : executeInsertCommandType
    readonly deleteText : executeDeleteCommandType
    readonly viewText  : string
    readonly viewStackCommands : executeViewStackCommandsType
    readonly previousOperation : executePreviousCommandType
    readonly nextOperation : executeNextCommandType
}
class TextEditor implements ITextEditor {
    readonly #enteredText : string[] = []
    readonly #commandStack : stackType = []
    
    #temporaryMaximumIndex : number | null = null
    #indexCommandStack : number | null = null

    get viewText () {
        return `view text - ${this.#enteredText.join ('')}`
    }
    #indexCommandStackUp () {
        if (this.#indexCommandStack !== null) {
            ++ this.#indexCommandStack
        }
    }
    #indexCommandStackDown () {
        if (this.#indexCommandStack !== null) {
            -- this.#indexCommandStack
        }
    }

    insertText (position : number , insertText : string) {
        this.#enteredText.splice (position , 0 , insertText )

        this.#commandStack.push ([EOperation.Insert , position , insertText])
        this.#indexCommandStack  = null
        this.#temporaryMaximumIndex = null
        console.log  (`insert text - ${insertText} - "${this.#enteredText.join ('')}"`)
    }

    deleteText (position : number , removeAmountText : number) {
        const returnText = this.#enteredText.splice (position , removeAmountText)
        this.#commandStack.push ([EOperation.Delete , position , returnText.join ('')])
        this.#indexCommandStack  = null
        this.#temporaryMaximumIndex = null

        console.log (`delete text - ${returnText.join ('')} - "${this.#enteredText.join ('')}"`)
    }

    viewStackCommands ()  {
        console.log ('stack of all commands')
        this.#commandStack.forEach (item => {
            console.log (`command - ${item[0]}, position - ${item[1]}, text - ${item[2]}`)
        })
    }

    previousOperation () {
        if (this.#temporaryMaximumIndex === null) {
            this.#temporaryMaximumIndex = this.#commandStack.length - 1
        }
        if (this.#indexCommandStack === null) {
            this.#indexCommandStack = this.#commandStack.length - 1
        }
        if (this.#indexCommandStack >=  0) {
            const element = this.#commandStack[this.#indexCommandStack]
            if (Array.isArray (element)) {
                const position = element[1]
                
                switch (element[0]) {
                    case EOperation.Insert :
                        const removeAmountText = element[2].length
                            const text = this.#enteredText.splice (position , removeAmountText)
                            this.#commandStack.push ([EOperation.Delete , position , text.join ('')])
                            this.#indexCommandStackDown ()
                            console.log  (`previous operation - "${this.#enteredText.join ('')}"`)
                        break
                    case EOperation.Delete :
                            const insertText = element[2]
                            this.#enteredText.splice (position , 0 , insertText)
                            this.#commandStack.push ([EOperation.Insert , position , insertText])
                            this.#indexCommandStackDown ()
                            console.log  (`previous operation - "${this.#enteredText.join ('')}"`)
                        break
                }
            }
        }
    }

    nextOperation () {
        if (this.#temporaryMaximumIndex === null) {
            this.#temporaryMaximumIndex = this.#commandStack.length - 1
        }
        if (this.#indexCommandStack !== null) {
            if (this.#indexCommandStack < this.#temporaryMaximumIndex) {
                this.#indexCommandStackUp ()
                const element = this.#commandStack[this.#indexCommandStack]
                
                if (Array.isArray (element)) {
                    const position = element[1]
                    
                    switch (element[0]) {
                        case EOperation.Insert :
                            const insertText = element[2]
                                this.#enteredText.splice (position , 0 , insertText)
                                this.#commandStack.push ([EOperation.Insert , position , insertText])
                                console.log  (`next operation - "${this.#enteredText.join ('')}"`)
                            break
                        case EOperation.Delete :
                                const removeAmountText = element[2].length
                                const text = this.#enteredText.splice (position , removeAmountText)
                                this.#commandStack.push ([EOperation.Delete , position , text.join ('')])
                                console.log  (`next operation - "${this.#enteredText.join ('')}"`)
                            break
                    }
                }
            }
        }
    }
}

interface ICommand<T extends executeType> {
    execute : T
}
abstract class Command<T extends executeType> implements ICommand<T> {
    constructor (
        protected readonly textEditor : ITextEditor
    ) {}

    abstract execute : T
}
class InsertCommand extends Command<executeInsertCommandType> {
    execute = (position : number , insertText : string) => {
        this.textEditor.insertText (position , insertText)
    }
}
class DeleteCommand extends Command<executeDeleteCommandType> {
    execute = (position : number , removeAmountText : number) => {
        this.textEditor.deleteText (position , removeAmountText)
    }
}
class ViewCommand extends Command<executeViewCommandType> {
    execute = () => this.textEditor.viewText
}
class ViewStackCommands extends Command<executeViewStackCommandsType> {
    execute = () => {
        this.textEditor.viewStackCommands ()
    }
}
class PreviousCommand extends Command<executePreviousCommandType> {
    execute = () => {
        this.textEditor.previousOperation ()
    }
}
class NextCommand extends Command<executeNextCommandType> {
    execute = () => {
        this.textEditor.nextOperation ()
    }
}
type CommandsType = InsertCommand 
                                            | DeleteCommand 
                                            | ViewCommand
                                            | PreviousCommand
                                            | NextCommand

function isInsertCommand (type : CommandsType) : type is InsertCommand {
    return type instanceof InsertCommand
}
function isDeleteCommand  (type : CommandsType) : type is DeleteCommand  {
    return type instanceof DeleteCommand 
}
function isViewCommand (type : CommandsType) : type is ViewCommand {
    return type instanceof ViewCommand
}
function isViewStackCommands (type : CommandsType) : type is ViewStackCommands {
    return type instanceof ViewStackCommands
}
function isPreviousCommand (type : CommandsType) : type is PreviousCommand {
    return type instanceof PreviousCommand
}
function isNextCommand (type : CommandsType) : type is NextCommand {
    return type instanceof NextCommand
}

enum EOperation {
    Insert = 'Insert' ,
    Delete = 'Delete'
}
interface IInvoker {
    executeСommand : (command : CommandsType) => void
    beginСommand : executeType
}
class Invoker implements IInvoker {
    readonly #commandStack : [EOperation , number , string | number][] = []
    #indexCommandStack !: number
    #command !: CommandsType
    
    executeСommand (command : CommandsType)  {
        this.#command = command
    }

    beginСommand (position ?: number , insertOrDelete ?: string | number) {
        if (this.#command) {
            if (isInsertCommand (this.#command)) {
                if (position !== undefined && typeof insertOrDelete === 'string') {
                    this.#commandStack.push ([EOperation.Insert , position , insertOrDelete])
                    if (!this.#indexCommandStack) {
                        this.#indexCommandStack = 0
                    }else {
                        ++ this.#indexCommandStack
                    }
                    this.#command.execute (position , insertOrDelete)
                }
            }
            if (isDeleteCommand (this.#command)) {
                if (position && insertOrDelete) {
                    if (typeof insertOrDelete === 'number') {
                        this.#commandStack.push ([EOperation.Delete , position , insertOrDelete])
                        if (!this.#indexCommandStack) {
                            this.#indexCommandStack = 0
                        }else {
                            ++ this.#indexCommandStack
                        }
                        this.#command.execute (position , insertOrDelete)
                    }
                }
            }
            if (isViewCommand (this.#command)) {
                return this.#command.execute ()
            }
            if (isPreviousCommand (this.#command)) {
                return this.#command.execute ()
            }
            if (isNextCommand (this.#command)) {
                return this.#command.execute ()
            }
            if (isViewStackCommands (this.#command)) {
                return this.#command.execute ()
            }
        }
    }

    operationStack () {
        console.log (`operation stack`)
        console.log (this.#commandStack)
    }
}

interface IClient {
    readonly workingWithTextEditor : () => void
}
class Client {
    readonly #textEditor : ITextEditor = new TextEditor ()
    readonly #viewEnteredText : Command<executeViewCommandType> = new ViewCommand (this.#textEditor)
    readonly #viewStackCommands : Command<executeViewStackCommandsType> = new ViewStackCommands (this.#textEditor)
    readonly #addText : Command<executeInsertCommandType> = new InsertCommand (this.#textEditor)
    readonly #deleteText : Command<executeDeleteCommandType> = new DeleteCommand (this.#textEditor)
    readonly #previousCommand : Command<executePreviousCommandType> = new PreviousCommand (this.#textEditor)
    readonly #nextCommand : Command<executeNextCommandType> = new NextCommand (this.#textEditor)
    readonly #invoker : Invoker = new Invoker ()
    
    workingWithTextEditor () {
        this.#invoker.beginСommand ()
        this.#invoker.executeСommand (this.#addText)
        this.#invoker.beginСommand (0 , 'a')
        this.#invoker.executeСommand (this.#addText)
        this.#invoker.beginСommand (1 , 'b')
        this.#invoker.executeСommand (this.#addText)
        this.#invoker.beginСommand (2 , 'c')
        this.#invoker.executeСommand (this.#addText)
        this.#invoker.beginСommand (3 , 'd')
        this.#invoker.executeСommand (this.#addText)
        this.#invoker.beginСommand (4 , 'e')
        this.#invoker.executeСommand (this.#addText)
        this.#invoker.beginСommand (5 , 'f')
        this.#invoker.executeСommand (this.#deleteText)
        this.#invoker.beginСommand (5 , 1)

        console.log ('___________________')

        this.#invoker.executeСommand (this.#previousCommand)
        this.#invoker.beginСommand ()
        this.#invoker.executeСommand (this.#previousCommand)
        this.#invoker.beginСommand ()
        this.#invoker.executeСommand (this.#previousCommand)
        this.#invoker.beginСommand ()
        this.#invoker.executeСommand (this.#previousCommand)
        this.#invoker.beginСommand ()
        this.#invoker.executeСommand (this.#previousCommand)
        this.#invoker.beginСommand ()
        this.#invoker.executeСommand (this.#previousCommand)
        this.#invoker.beginСommand ()
        this.#invoker.executeСommand (this.#previousCommand)
        this.#invoker.beginСommand ()
        this.#invoker.executeСommand (this.#nextCommand)
        this.#invoker.beginСommand ()
        this.#invoker.executeСommand (this.#nextCommand)
        this.#invoker.beginСommand ()
        this.#invoker.executeСommand (this.#nextCommand)
        this.#invoker.beginСommand ()
        this.#invoker.executeСommand (this.#nextCommand)
        this.#invoker.beginСommand ()
        this.#invoker.executeСommand (this.#nextCommand)
        this.#invoker.beginСommand ()
        this.#invoker.executeСommand (this.#addText)
        this.#invoker.beginСommand (5 , 'm')
        this.#invoker.executeСommand (this.#addText)
        this.#invoker.beginСommand (6 , 'n')
        this.#invoker.executeСommand (this.#deleteText)
        this.#invoker.beginСommand (6 , 1)
        this.#invoker.executeСommand (this.#nextCommand)
        this.#invoker.beginСommand ()
        this.#invoker.executeСommand (this.#previousCommand)
        this.#invoker.beginСommand ()
        this.#invoker.executeСommand (this.#previousCommand)
        this.#invoker.beginСommand ()
        this.#invoker.executeСommand (this.#previousCommand)
        this.#invoker.beginСommand ()
        this.#invoker.executeСommand (this.#nextCommand)
        this.#invoker.beginСommand ()
        this.#invoker.executeСommand (this.#nextCommand)
        this.#invoker.beginСommand ()
        this.#invoker.executeСommand (this.#nextCommand)
        this.#invoker.beginСommand ()
        this.#invoker.executeСommand (this.#nextCommand)
        this.#invoker.beginСommand ()
        this.#invoker.executeСommand (this.#nextCommand)
        this.#invoker.beginСommand ()
        this.#invoker.executeСommand (this.#previousCommand)
        this.#invoker.beginСommand ()
        this.#invoker.executeСommand (this.#previousCommand)
        this.#invoker.beginСommand ()
        this.#invoker.executeСommand (this.#previousCommand)
        this.#invoker.beginСommand ()
        this.#invoker.executeСommand (this.#previousCommand)
        this.#invoker.beginСommand ()
        this.#invoker.executeСommand (this.#previousCommand)
        this.#invoker.beginСommand ()
        this.#invoker.executeСommand (this.#previousCommand)
        this.#invoker.beginСommand ()
        this.#invoker.executeСommand (this.#previousCommand)
        this.#invoker.beginСommand ()
        this.#invoker.executeСommand (this.#previousCommand)
        this.#invoker.beginСommand ()
        this.#invoker.executeСommand (this.#previousCommand)
        this.#invoker.beginСommand ()
        this.#invoker.executeСommand (this.#previousCommand)
        this.#invoker.beginСommand ()
        this.#invoker.executeСommand (this.#previousCommand)
        this.#invoker.beginСommand ()
        this.#invoker.executeСommand (this.#previousCommand)
        this.#invoker.beginСommand ()
        this.#invoker.executeСommand (this.#previousCommand)
        this.#invoker.beginСommand ()
        this.#invoker.executeСommand (this.#previousCommand)
        this.#invoker.beginСommand ()
        this.#invoker.executeСommand (this.#previousCommand)
        this.#invoker.beginСommand ()
        this.#invoker.executeСommand (this.#previousCommand)
        this.#invoker.beginСommand ()
        this.#invoker.executeСommand (this.#previousCommand)
        this.#invoker.beginСommand ()
        this.#invoker.executeСommand (this.#previousCommand)
        this.#invoker.beginСommand ()
        this.#invoker.executeСommand (this.#previousCommand)
        this.#invoker.beginСommand ()
        this.#invoker.executeСommand (this.#previousCommand)
        this.#invoker.beginСommand ()
        this.#invoker.executeСommand (this.#previousCommand)
        this.#invoker.beginСommand ()
        console.log ('___________________')

        this.#invoker.executeСommand (this.#viewEnteredText)
        console.log (this.#invoker.beginСommand ())

        console.log ('___________________')
        this.#invoker.operationStack ()

        console.log ('___________________')
        this.#invoker.executeСommand (this.#viewStackCommands)
        this.#invoker.beginСommand ()
    }
}

const client = new Client ()

client.workingWithTextEditor ()