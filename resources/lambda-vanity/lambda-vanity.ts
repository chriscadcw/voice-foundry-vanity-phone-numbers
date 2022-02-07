/*
This code retrieves the phone number from the associated contact flow
and attempts to derive the 5 "best"[1] vanity numbers from that phone number
and store the results a dynamoDB table tied to the original phone number

[1] "best" is determined to be the closest verbal representation of a number
    that does not contain offensive or slanderous words, this output can not
    be 100% guarenteed as new words are added to the offsensive list constantly
 */
import * as AWS from 'aws-sdk';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { ConnectContactFlowCallback, ConnectContactFlowEvent, ConnectContactFlowResult, Context } from 'aws-lambda';

const words:string[] = require('an-array-of-english-words');

/**
 * Function name: validateNumber
 * @param number string
 * 
 * Inside the function:
 * 1. Validates that the number can be processed
 * 2. If it is not a number, or the number is empty, throws an error 'Phone number was null or undefined'
 * 3. If the number is not a valid number, throws an error 'Invalid phone number.'
 * 4. If the number passes validation, returns the output from processPhoneNumber()
 */
const validateNumber = (number: string): string => {
    // Uses a standard expression to match valid, ten digit US phone numbers
    const validPhoneNumber = /^(\+1|1)?\d{10}$/;

    if( !number ){
        throw Error("Phone number was null or undefined");    
    }

    if( !number.match(validPhoneNumber) ){
        throw Error("Invalid phone number");
    }

    return processPhoneNumber(number);
}

/**
 * Function name: processPhoneNumber
 * @param phoneNumber string
 * @returns 
 */
const processPhoneNumber = (phoneNumber: string): string => {
    // The regex to use to separate the country code from the rest of the phone number
    const phoneRegex = /^(\+1|1)?(\d{10})$/;

    // Returns only the last 10 digits of the phone number
    return phoneNumber.replace( phoneRegex, '$2' );
}

/**
 * Function name: save
 * @param phoneNumber string
 * @param vanityList string[]
 * @param ddb DynamoDBDocumentClient
 * 
 * Inside the function:
 * 1. Set up the parameters to use to save the number to the dynamo database
 * 2. Saves the data to the database and returns the promise frm the transaction
 */
const save = async (phoneNumber: string, vanityList: string[], ddb: DynamoDBDocumentClient ) => {

    // Build the parameters to make the request
    const params: any = {
        TableName: 'vanity_numbers',
        Item: {
            phone_number: phoneNumber,
            vanity_numbers: vanityList
        },
        ConditionExpresion: 'attribute_not_exists(phone_number)',
        ReturnConsumedCapacity: 'TOTAL'
    };

    await ddb.send(
        new PutCommand(params)
    )
}

/**
 * Function name: generateVanityPhoneNumbers
 * @param number string
 * @param ddb DynamoDBDocumentClient
 * 
 * @return Promise<string[]>
 * 
 * Inside the function:
 * 1. Checks the database to determine if a vanity list already exists
 * 2. If a vanity list exists, return that vanity list <= Returns out of the function
 * 3. If no vanity list exists, instantiate a new vanityList 
 * 4. Split the phone number into the firstThree and lastSeven numbers (will use lastSeven to create vanity)
 * 5. Set up array map with keypad mappings
 * 6. Split the specific key mappings for each number into arrays
 * 7. Itterate over nested arrays to create string combinations based on the numbers received
 * 8. Add the first 5 permitations as 'throw away' permitations (i.e. will usually be something like 1111111)
 * 9. After the first 5, check if the number exists in the array of English
 *    words provided by the 'an-array-of-english-words' package, if it does, 
 *    add it to the vanityList array
 * 10. Pull the last 5 matches from the vanityList
 * 11. Store those matches in the database
 * 12. Return the matches * 
 */
const generateVanityPhoneNumbers = async (number: string, ddb: DynamoDBDocumentClient): Promise<string[]> => {
    let vanityList: string[] = await checkDatabase(number, ddb);

    if(vanityList != undefined && vanityList.length > 0){
        // The vanity list already exists in the database, so return it
        return vanityList;
    }

    vanityList = [];

    // Pulls the first three digits from the phone number
    const firstThree = number.slice(0,3);
    // Pulls the last seven numbers from the phone number
    const lastSeven = number.slice(3).split('');        

    const letterMap = new Map([
        ['0', '0'],
        ['1', '1'],
        ['2', 'ABC'],
        ['3', 'DEF'],
        ['4', 'GHI'],
        ['5', 'JKL'],
        ['6', 'MNO'],
        ['7', 'PQRS'],
        ['8', 'TUV'],
        ['9', 'WXYZ']
    ]);

    const spotOneStr = letterMap.get(lastSeven[0])?.split('') ;
    const spotTwoStr = letterMap.get(lastSeven[1])?.split('');
    const spotThreeStr = letterMap.get(lastSeven[2])?.split('');
    const spotFourStr = letterMap.get(lastSeven[3])?.split('');
    const spotFiveStr = letterMap.get(lastSeven[4])?.split('');
    const spotSixStr = letterMap.get(lastSeven[5])?.split('');
    const spotSevenStr = letterMap.get(lastSeven[6])?.split('');

    // Check if any of the string arrays are empty, which means that the lastSeven didn't pick up all of the values
    if( spotOneStr == undefined || spotTwoStr == undefined || spotThreeStr == undefined || spotFourStr == undefined || 
        spotFiveStr == undefined || spotSixStr == undefined || spotSevenStr == undefined ){
            throw new Error("Unable to retrieve all number strings.");
        }

    // Loop through each groups of letters to create a combination string from each group of letters
    // At each iteration and sub iteration, we check to see if the list has been completed and if so
    //  break out to the previous level 
    for( let i = 0; i < spotOneStr.length; i++ ){
        if( vanityList.length >= 5 ){
            // list already contains the 5 words
            break;
        }
        
        for ( let j = 0; j < spotTwoStr.length; j++ ){
            if( vanityList.length >= 5 ){
                // list already contains the 5 words
                break;
            }
            
            for ( let k = 0; k < spotThreeStr.length; k++ ){
                if( vanityList.length >= 5 ){
                    // list already contains the 5 words
                    break;
                }

                for ( let m = 0; m < spotFourStr.length; m++ ){
                    if( vanityList.length >= 5 ){
                        // list already contains the 5 words
                        break;
                    }

                    for ( let n = 0; n < spotFiveStr.length; n++ ){
                        if( vanityList.length >= 5 ){
                            // list already contains the 5 words
                            break;
                        }

                        for ( let p = 0; p < spotSixStr.length; p++ ){
                            if( vanityList.length >= 5 ){
                                // list already contains the 5 words
                                break;
                            }

                            for ( let q = 0; q < spotSevenStr.length; q++ ){
                                if( vanityList.length >= 5 ){
                                    // list already contains the 5 words
                                    break;
                                }

                                const phoneWord = spotOneStr[i] + spotTwoStr[j] + spotThreeStr[k] + spotFourStr[m] + spotFiveStr[n] + spotSixStr[p] + spotSevenStr[q];
                                const vanityNumber = firstThree + phoneWord;
                                if( words.includes(phoneWord.toLowerCase() ) ){                                                                        
                                    // If the combinations of letters from the 7 characters forms a word, add it to the list
                                    vanityList.push(vanityNumber);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // If there were no combinations found using the full seven digit string,
    // We'll attempt a search based on just the last four instead
    if( vanityList.length == 0 ) { // The default list length of nonsense combinations is 7                

        // Pulls the first six digits from the phone number
        const firstSix = number.slice(0,6);
        // Pulls only the last four digits from the phone number
        const lastFour = number.slice(6).split('');

        const retrySpotOneStr = letterMap.get(lastFour[0])?.split('') ;
        const retrySpotTwoStr = letterMap.get(lastFour[1])?.split('');
        const retrySpotThreeStr = letterMap.get(lastFour[2])?.split('');
        const retrySpotFourStr = letterMap.get(lastFour[3])?.split('');

        // Check if any of the string arrays are empty, which means that the lastSeven didn't pick up all of the values
        if( retrySpotOneStr == undefined || retrySpotTwoStr == undefined || retrySpotThreeStr == undefined || retrySpotFourStr == undefined ){
            throw new Error("Unable to retrieve all number strings.");
        } 

        // Loop through each combination of digits to attempt to find words
        for( let i = 0; i < retrySpotOneStr.length; i++ ){
            // If the vanity list is full, we'll stop the loop
            if( vanityList.length >= 5 ){
                break;
            }

            for( let j = 0; j < retrySpotTwoStr.length; j++ ){
                // If the vanity list is full, we'll stop the loop
                if( vanityList.length >= 5 ){
                    break;
                }

                for( let k = 0; k < retrySpotThreeStr.length; k++ ){
                    // If the vanity list is full, we'll stop the loop
                    if( vanityList.length >= 5 ){
                        break;
                    }

                    for( let m = 0; m < retrySpotFourStr.length; m++ ){
                        // If the vanity list is full, we'll stop the loop
                        if( vanityList.length >= 5 ){
                            break;
                        }
                        const phoneWord = retrySpotOneStr[i] + retrySpotTwoStr[j] + retrySpotThreeStr[k] + retrySpotFourStr[m];
                        const vanityNumber = firstSix + phoneWord;
                        // If the vanity word created by the last four digits is in the words list, add it to the vanity list
                        if( words.includes(phoneWord) ){
                            vanityList.push(vanityNumber);
                        }

                    }
                }
            }
        }
    }
    
    if( vanityList.length > 0 ){
        console.log('Generated vanity numbers! Saving to db: ' + vanityList);
        await save(number, vanityList, ddb);
    } else {
        vanityList.push("We're sorry, there were no vanity numbers that matched your phone number.")
    }

    return vanityList;
  
}

/**
 * Function name: checkDatabse
 * @param number string
 * @param ddb DynamoDBDocumentClient
 * 
 * @return Promise<string[]>
 * 
 * Inside the function:
 * 1. Makes a request to the database for the incoming phone number
 *    to see if there is a record stored already
 * 2. If there is a record already stored, return the record
 * 3. Else, return an empty array in the promise
 */
const checkDatabase = async (number: string, ddb: DynamoDBDocumentClient): Promise<string[]> => 
{   
    const params = {
        TableName: 'vanity_numbers',
        Key: {
            phone_number: number
        }
    };

    let results: string[] = [];
   
    try {
        const result = await ddb.send(new GetCommand(params));
        if( result.Item?.vanity_numbers != undefined ){
            console.log('Found vanity numbers in db: ' + result.Item.vanity_numbers);
            results = result.Item?.vanity_numbers;
        }
    } catch(err){
        console.error(err);  
        throw new Error("Encountered an error while trying to request existing records: " + err);
    } 

    return results;
}


/**
 * Function name: vanityPhoneNumberHandler
 * @param event ConnectContactFlowEvent
 * @param context Context
 * @param callback ConnectContactFlowCallback
 * 
 * @return string
 * 
 * Inside the function:
 */
export const vanityPhoneNumberHandler = async ( event: ConnectContactFlowEvent, context: Context, callback: ConnectContactFlowCallback )=> {
    AWS.config.update({ region: process.env.AWS_REGION });

    const dynamoDB = new DynamoDBClient({});
    const ddb = DynamoDBDocumentClient.from(dynamoDB);

    try { 
        const phoneNumber = event.Details?.ContactData?.CustomerEndpoint?.Address;
        if( phoneNumber == undefined){
            throw new Error('Unable to get event details from ConnectContactFlowEvent');
        }
        
        const validatedNumber = validateNumber(phoneNumber);

        const vanityList = await generateVanityPhoneNumbers(validatedNumber, ddb);

        const result: ConnectContactFlowResult = {};

        const finalVanityList = vanityList.slice(-3); // We're only returning the last 5 matches to the user
        
        for ( let i = 0; i < finalVanityList.length; i++ ){
            result['number' + i] = finalVanityList[i].replace(/(.)/g, '$&, ');
        }

        let status = '';
        if( result['number0'] !== 'undefined'){
            status = 'Success!';
        } else {
            status = 'No matches found.';
        }
        callback(null, result);        
        console.log(status);
        return status;
    } catch (err){
        const status = 'Failure!';
        console.log(status);
        console.log(err);        
        callback(err as Error);
        return status;
    }
};

