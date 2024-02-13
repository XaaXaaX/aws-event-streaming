import * as cdk from 'aws-cdk-lib';
import { EventBus, Rule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { ManagedPolicy, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import { resolve } from 'path';

export class EvenyBridgeBusBroadcastingStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    
    const functionRole = new Role(this, 'FunctionRole', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')
      ]
    });
    const eventbus = new EventBus(this, 'EventBus');

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
      
      new Rule(this, `EventBridgeLambdaInvokeRule-${i}`, {
        eventBus: eventbus,
        eventPattern: {
          detailType: ['my.custom.detailtype'],
        },
        targets: [ new LambdaFunction(consumerFunction) ]
      }); 
    }
  }
}
