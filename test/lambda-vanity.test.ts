// file: lambda-vanity.test.js

import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { vanityPhoneNumberHandler } from "../resources/lambda-vanity/lambda-vanity";
import * as fs from 'fs';
//import { expect } from 'chai';

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

    it( 'returns a match for a seven letter string', async () => {
        const eventData = JSON.parse(fs.readFileSync('events/event-seven-letters.json').toString());
        await LambdaTester(vanityPhoneNumberHandler)
                    .event( eventData )
                    .expectResult ( (result: {'number0': string}) => {                                      
                        expect(result.number0).toEqual("6, 1, 6, L, I, B, R, A, R, Y, ");
                    });
    });

    it( 'returns a match for a seven letter string', async () => {
        const eventData = JSON.parse(fs.readFileSync('events/event-four-letters.json').toString());
        await LambdaTester(vanityPhoneNumberHandler)
                    .event( eventData )                    
                    .expectResult ( (result: {'number0': string}) => {                        
                        expect(result.number0).toEqual("6, 1, 6, 7, 2, 4, A, H, E, D, ");
                    });
    });

    it( 'fails to complete if event data is incomplete', async () => {
        const eventData = JSON.parse(fs.readFileSync('events/event-incomplete.json').toString());
        await LambdaTester(vanityPhoneNumberHandler)
                    .event( eventData )
                    .expectError( ( err: Error ) => {
                        expect(err.message).toBe('Unable to get event details from ConnectContactFlowEvent')
                    });
    });
});
