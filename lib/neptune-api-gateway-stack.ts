import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { DatabaseCluster, InstanceType } from '@aws-cdk/aws-neptune-alpha';
import { APIGW } from './api-gw';

export class NeptuneApiGatewayStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create VPC that will hold lambdas and db cluster
    const vpc = new Vpc(this, 'NeptuneGWVPC');


    // Create Neptune Cluster
    const cluster = new DatabaseCluster(this, 'NeptuneDBCluster', {
      instanceType: InstanceType.R5_LARGE,
      vpc,
      iamAuthentication: false,
    });

    // allow anyone in "vpc" to access
    cluster.connections.allowDefaultPortFromAnyIpv4('Open to everyone');

    // get references to establish a websocket connection with lambda
    const writeAddress = cluster.clusterEndpoint.socketAddress;
    const readAddress = cluster.clusterReadEndpoint.socketAddress;


    // Create lambda and API gateway
    new APIGW(this, {
      vpc,
      writeAddress,
      readAddress
    });


    new CfnOutput(this, 'NeptuneReadAddressOutput', {
      value: readAddress,
      exportName: 'NeptuneReadAddressOutput'
    });
    new CfnOutput(this, 'NeptuneWriteAddressOutput', {
      value: writeAddress,
      exportName: 'NeptuneWriteAddressOutput'
    });
  }
}
