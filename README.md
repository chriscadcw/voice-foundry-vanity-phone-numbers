# Welcome to the Voice Foundry Vanity Number Project for Christopher Carrigan!

# Included in this repo
* The project CDK Stack files
    - `lib/voice-foundry-stack.ts`
    - `bin/voice-foundry.ts`
* The Lambda function to be executed by the Connect Contact Flow
    - `resources/voice-foundry-stack.ts`
* A prebuilt Connect Contact Flow that can be imported into your AWS Connect
    - `VanityPhoneNumbersConnectTemplate`
* Unit testing for the lambda function and CDK Stack
    - `test/*`

# What it does
This project creates a deployable AWS CloudFormation template that does the following:
* Creates a role for lambda to use for execution of the included function
* Deploys a Lambda function using the code in the resources/lambda-vanity/lambda-vanity.zip file
* Create a DynamoDB database to store vanity phone number matches that it finds
* Grants the lambda role access to perform read/write operations on the table
* A demonstration of this completed project can be tested by calling `833-378-2210`

# Installation
1. Download Complete Repo Package
2. Unzip into downloaded file into a folder of your choice
3. Navigate to the folder you chose in a terminal
4. Execute the following commands to deploy the included solution
   * NOTE: You will need to have your AWS credentials set up before attempting deployment.  Instructions can be found at https://docs.aws.amazon.com/cli/latest/userguide/getting-started-prereqs.html#getting-started-prereqs-iam
   1. `cdk bootstrap` - Sets up the environment to allow for the template to deploy
   2. `cdk deploy` - Deploys the actual solution
5. Once the deployment has succeeded
   1. Log into your AWS Connect Console Contact Flows at https://console.amazonaws.com/connect/v2/app/settings/contact-flows
   2. In the AWS Lambda section, choose `VoiceFoundryStack-VanityNumbersFunction` from the dropdown and click `Add Lambda Function`, this will make the function usable in AWS Connect Contact Flows
   3. Switch to the instances tab on the left-hand side and click the `Access URL` for the instance you would like to add the function to.
   4. Once on the AWS Connect Dashboard, navigate to `Routing > Contact Flows`
   5. Click the `Create Contact Flow` button
   6. From the dropdown on the right-hand side, choose `Import Flow`
   7. Click `Show All Files` and navigate to the folder you unzipped the project into and select the `VanityPhoneNumbersContactTemplate` file and click `Open`
   8. Click `Save` and then `Publish` to make the new Contact Flow available in your AWS Connect instance
   9. To assign the new Contact Flow to a particular phone number, navigate to `Routing > Phone numbers` and click on the phone number you would like to attach it to.
   10. From the `Contact flow / IVR` dropdown, choose `VanityPhoneNumbers` and click `Save`, the new Contact Flow is now assigned to that phone number  

# Other Notes
* The lambda-vanity.zip file contains the script at resources/lambda-vanity/lambda-vanity.js
* Tests are included for the stack as well as the lambda function that can be invoked by running `npm run test`
* The included cdk stack can be deployed by running the following commands
    - `cdk bootstrap`
    - `cdk deploy`
* After deployment, the Lambda function will have to imported into the Connect Contact Flow

# Future Options
* With more time and a better understanding of the AWS CDK in relation to AWS Connect
  I would have liked to add functionality to the CDK template to attach the lambda function
  directly to the Connect Contact Flow as part of the CDK deployment.
* Given more time I would have liked to expand the Connect Contact Flow to handle both voice and text input via an 
  Amazon Lex Bot integration.  

