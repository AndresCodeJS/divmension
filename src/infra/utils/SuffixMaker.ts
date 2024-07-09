
import { Stack } from "aws-cdk-lib";
import * as cdk from 'aws-cdk-lib';

//Usado para crear ID únicos

export function getSuffixFromStack(stack : Stack): String {
    const shortStackId = cdk.Fn.select(2, cdk.Fn.split('/', stack.stackId))
    const stackSuffix = cdk.Fn.select(4, cdk.Fn.split('-', shortStackId))

    return stackSuffix
}