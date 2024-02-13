#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { EvenyBridgeBusBroadcastingStack } from '../lib/app-stack';

const app = new cdk.App();
new EvenyBridgeBusBroadcastingStack(app, `${EvenyBridgeBusBroadcastingStack.name}`, {});