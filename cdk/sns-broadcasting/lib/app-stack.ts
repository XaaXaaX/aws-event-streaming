import * as cdk from 'aws-cdk-lib';
import { ManagedPolicy, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import { SnsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { Construct } from 'constructs';
import { resolve } from 'path';

export class SnsBroadcastingStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    
    const functionRole = new Role(this, 'FunctionRole', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')
      ]
    });
    const topic = new Topic(this, 'Topic');

    for(let i = 0; i < 15; i++) {
      const functionName = `function-${i}`;
      const logGroup = new LogGroup(this, `Function-${i}-LogGroup`, {
        logGroupName: `/aws/lambda/${functionName}`,
        retention: RetentionDays.ONE_DAY,
        removalPolicy: cdk.RemovalPolicy.DESTROY
      });

      const consumerFunction = new NodejsFunction(this, `Function-${i}`, {
        role: functionRole,
        entry: resolve(`src/handlers/example/index.ts`),
        architecture: Architecture.ARM_64,
        runtime: Runtime.NODEJS_20_X,
        timeout: cdk.Duration.seconds(10),
        logGroup: logGroup,
        handler: 'handler',
        bundling: {
          minify: true,
        },
      });
      consumerFunction.addEventSource(new SnsEventSource(topic, {}));
    }
  }
}
