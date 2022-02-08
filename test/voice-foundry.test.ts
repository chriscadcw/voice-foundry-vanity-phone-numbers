import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import * as VoiceFoundry from '../lib/voice-foundry-stack';

test('DynamoDB Table Resource Created', () => {
    const app = new cdk.App();
    //    WHEN
    const stack = new VoiceFoundry.VoiceFoundryStack(app, 'MyTestStack');
    // THEN
   const template = Template.fromStack(stack);

   template.hasResourceProperties('AWS::DynamoDB::Table',
     Match.objectLike({
       KeySchema: [
         {
           AttributeName: "phone_number",
           KeyType: "HASH"
         }
       ],
       AttributeDefinitions: [
         {
           AttributeName: "phone_number",
           AttributeType: "S"
         }
       ],
       ProvisionedThroughput: {
         ReadCapacityUnits: 5,
         WriteCapacityUnits: 5
       },
       TableName: "vanity_numbers"
   }));
});

test('Role for Lambda created', () => {
    const app = new cdk.App();

    const stack = new VoiceFoundry.VoiceFoundryStack(app, 'MyTestStack');

    const template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::IAM::Role',
      Match.objectLike({
          AssumeRolePolicyDocument: {
            Statement: [
              {
                Action: "sts:AssumeRole",
                Effect: "Allow",
                Principal: {
                  Service: "lambda.amazonaws.com"
                }
              }
            ],
            Version: "2012-10-17"
          }
      }));
});

test('Policy for Lambda Role created', () => {
    const app = new cdk.App();

    const stack = new VoiceFoundry.VoiceFoundryStack(app, 'MyTestStack');

    const template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::IAM::Policy',
      Match.objectLike(
        {
          PolicyDocument: {
            Statement: [
              {
                Action: [
                  "dynamodb:BatchGetItem",
                  "dynamodb:GetRecords",
                  "dynamodb:GetShardIterator",
                  "dynamodb:Query",
                  "dynamodb:GetItem",
                  "dynamodb:Scan",
                  "dynamodb:ConditionCheckItem",
                  "dynamodb:BatchWriteItem",
                  "dynamodb:PutItem",
                  "dynamodb:UpdateItem",
                  "dynamodb:DeleteItem"
                ],
                Effect: "Allow",
                Resource: [
                  {
                    "Fn::GetAtt": [
                      "vanitynumbers37C1FD8A",
                      "Arn"
                    ]
                  },
                  {
                    "Ref": "AWS::NoValue"
                  }
                ]
              }
            ],
            Version: "2012-10-17"
          },
          PolicyName: "VanityLambdaExecutionRoleDefaultPolicyA0D5417A",
          Roles: [
            {
              "Ref": "VanityLambdaExecutionRoleAAB232B7"
            }
          ]
        }
      ));
});
