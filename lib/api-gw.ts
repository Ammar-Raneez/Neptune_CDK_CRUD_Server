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
  private static lambdaNames = ['listPosts', 'createPost', 'updatePost', 'deletePost', 'getPost'];

  public constructor(private scope: Construct, private props: NeptuneProps) {
    this.initialize();
  }

  private initialize() {
    this.createRestAPI();
    this.createResources();
  }

  private createRestAPI() {
    this.api = new RestApi(this.scope, `NeptuneAPI`, {
      restApiName: `NeptuneAPI`,
    });
  }

  private createResources() {
    const lambdaResource = this.api.root.addResource('neptune-gw');
    const nestedResource = lambdaResource.addResource('{postId}');

    for (let i = 0; i < APIGW.lambdaNames.length; i++) {
      const lambda = this.createLambda(APIGW.lambdaNames[i]);
      const lambdaIntegration = this.createLambdaIntegration(lambda);
      switch (APIGW.lambdaNames[i]) {
        case APIGW.lambdaNames[2]:
        case APIGW.lambdaNames[3]:
          nestedResource.addMethod(APIGW.methods[i], lambdaIntegration);
          break;
        case APIGW.lambdaNames[4]:
          nestedResource.addMethod(APIGW.methods[0], lambdaIntegration);
          break;
        default:
          lambdaResource.addMethod(APIGW.methods[i], lambdaIntegration);
      }
    }
  }

  private createLambdaIntegration(lambda: NodejsFunction): LambdaIntegration {
    return new LambdaIntegration(lambda);
  }

  private createLambda(name: string): NodejsFunction {
    return new NodejsFunction(this.scope, name, {
      functionName: name,
      runtime: Runtime.NODEJS_14_X,
      handler: 'handler',
      entry: join(__dirname, '..', 'lambdas', `${name}.ts`),
      memorySize: 1024,
      environment: {
        WRITER: this.props.writeAddress,
        READER: this.props.readAddress
      },
      vpc: this.props.vpc,
    });
  }
}