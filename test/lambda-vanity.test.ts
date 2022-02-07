// file: lambda-vanity.test.js

import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { vanityPhoneNumberHandler } from "../resources/lambda-vanity/lambda-vanity";
import * as fs from 'fs';
import { expect } from 'chai';

const LambdaTester = require('lambda-tester');
const ddbMock = mockClient(DynamoDBDocumentClient);
describe("Unit tests for vanity generator lambda script", () => {
    beforeAll( () => {
        ddbMock.reset();
         
    });
    beforeEach( () => {
        ddbMock
            .on(GetCommand, {
                TableName: 'vanity_numbers'
            })
            .resolves({});
    })

    it( 'verifies that the script returns a response', async () => {       
        const eventData = JSON.parse(fs.readFileSync('events/event.json').toString());                 
        await LambdaTester(vanityPhoneNumberHandler)
                    .event( eventData )
                    .expectResult();
    });

    it( 'fails to complete if event data is incomplete', async () => {
        const eventData = JSON.parse(fs.readFileSync('events/event-incomplete.json').toString());
        await LambdaTester(vanityPhoneNumberHandler)
                    .event( eventData )
                    .expectError( ( err: Error ) => {
                        expect(err.message).to.equal('Unable to get event details from ConnectContactFlowEvent')
                    });
    });
});
