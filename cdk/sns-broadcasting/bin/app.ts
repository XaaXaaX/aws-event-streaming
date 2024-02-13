#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { SnsBroadcastingStack } from '../lib/app-stack';

const app = new cdk.App();
new SnsBroadcastingStack(app, `${SnsBroadcastingStack.name}`, {});