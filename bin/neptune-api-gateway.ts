#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { NeptuneApiGatewayStack } from '../lib/neptune-api-gateway-stack';

const app = new cdk.App();
new NeptuneApiGatewayStack(app, 'NeptuneApiGatewayStack', {
  env: {
    region: 'eu-west-1',
  }
});
