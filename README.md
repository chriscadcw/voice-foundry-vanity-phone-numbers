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

# Installation Notes
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
