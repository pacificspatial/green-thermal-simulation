
export const ComposeProvider = ({providers, children}) =>
    providers.reduceRight((acc, Provider) => <Provider>{acc}</Provider>, children)