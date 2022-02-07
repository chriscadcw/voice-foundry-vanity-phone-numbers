import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as VoiceFoundry from '../lib/voice-foundry-stack';

test('DynamoDB Table Resource Created', () => {
    const app = new cdk.App();
    //    WHEN
    const stack = new VoiceFoundry.VoiceFoundryStack(app, 'MyTestStack');
    // THEN
   const template = Template.fromStack(stack);

   template.hasResourceProperties('AWS::DynamoDB::Table', {
     VisibilityTimeout: 300
   });
});

test('Role for Lambda created', () => {
    const app = new cdk.App();

    const stack = new VoiceFoundry.VoiceFoundryStack(app, 'MyTestStack');

    const template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::Iam::Role', {
        VisiblityTimeout: 300
    })
});
