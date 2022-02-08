import { Stack, StackProps } from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';

export class VoiceFoundryStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const lambdaRole = new iam.Role(this, "VanityLambdaExecutionRole", {
      roleName: "VanityLambdaExecutionRole",
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      description: 'Service execution role used by lambda for VanityNumbersFunction'
    });

    const table = new dynamodb.Table(this, 'vanity_numbers', {
      tableName: 'vanity_numbers',
      partitionKey: { name: 'phone_number', type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    table.grantReadWriteData(lambdaRole);

    const lambadaFunction  = new lambda.Function(this, "VanityNumbersFunction", {
      functionName: 'vanityPhoneNumberFunction',
      code: lambda.Code.fromAsset('resources/lambda-vanity/lambda-vanity.zip'),
      handler: 'vanityPhoneNumberHandler',
      runtime: lambda.Runtime.NODEJS_14_X,
      role: lambdaRole
    });
    
  }
}
