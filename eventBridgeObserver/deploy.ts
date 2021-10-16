#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { EventBridgeObserver } from './';

const app = new cdk.App();
new EventBridgeObserver(app, 'EventBridgeObserver');
