import { StackProps } from 'aws-cdk-lib';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { join } from 'path';

interface NeptuneProps extends StackProps {
  readonly vpc: Vpc;
  readonly writeAddress: string;
  readonly readAddress: string;
}

export class APIGW {
  private api: RestApi;
  private static methods = ['GET', 'POST', 'PUT', 'DELETE'];
  private static lambdaNames = ['listPosts', 'createPost', 'updatePost', 'deletePost'];

  public constructor(private scope: Construct, private props: NeptuneProps) {

  }
}