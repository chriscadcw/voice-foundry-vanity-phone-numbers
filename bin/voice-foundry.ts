#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { VoiceFoundryStack } from '../lib/voice-foundry-stack';

const app = new cdk.App();
new VoiceFoundryStack(app, 'VoiceFoundryStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  }
});