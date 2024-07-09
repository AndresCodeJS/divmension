import { PlaceEntry } from "../model/model"

export class MissingFieldError extends Error {
    constructor(missingField: string) {
        super(`Value for ${missingField} expected`)
    }
}

export class userExistsError extends Error {
    constructor(message: string) {
        super(message)
    }
}


export class JsonError extends Error {}

export function validateAsPlaceEntry(arg: any) {
    if ((arg as PlaceEntry).location == undefined) {
        throw new MissingFieldError('location')
    }
    if ((arg as PlaceEntry).id == undefined) {
        throw new MissingFieldError('id')
    }
}