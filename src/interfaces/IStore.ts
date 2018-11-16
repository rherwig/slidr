export interface IStore<State> {
    getState(): State;
    setState(callback: (prevState: State) => State): void;
    listen(handler: (state: State, prevState: State) => void): void;
    unlisten(): void;
}
