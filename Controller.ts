const request = require('request-promise');
const promiseRetry = require('promise-retry');


class CONTROLLER {
  // data: { value: 'old1' }
  const REMOTE_RESOURCE_1_URL = 'http://example.com/api/resource1'
  // data: { value: 'old2' }
  const REMOTE_RESOURCE_2_URL = 'http://example.com/api/resource2'

  private _attemptUpdateRemoteAPI = (): Promise<void> => {
    
    const data = {
        previous_data:[{ value: 'old data' }],
        new_data1:[{ value: 'new data 1' }],
        new_data2:[{ value: 'new data 2' }]
      };

    return promiseRetry({ retries: 3}, retry => {
        return request.put({ url: REMOTE_RESOURCE_1_URL, body: data.new_data1, json: true }, undefined)
        .catch(retry);
    })
    .catch(err => {
        console.log(err);
        return Promise.reject({
            message: `first request failed!`
        });
    })
    .then(response => {
        //Do a response check in case REMOTE_RESOURCE_2_URL entirely depends on REMOTE_RESOURCE_1_URL's response(make sure there is data)
        if(response.ok && response.data.length > 0){
            return promiseRetry({ retries: 3 }, retry => {
                return request.put({ url: REMOTE_RESOURCE_2_URL, body: data.new_data2, json: true }, undefined)
                .catch(retry);
            });
        }
        //response was bad, we need to abort;
        else
        {
            return Promise.reject({
                message: `unknown error in the response!`
            });
        }
    })
    .catch(err => {
        if(err)
            return Promise.reject(err);
        
        console.log(err, 'Updating second url failed, rolling back...');
        return promiseRetry({ retries: 3 }, retry => {
            return request.put({ url: REMOTE_RESOURCE_1_URL, body: data.previous_data, json: true }, undefined)
            .catch(retry);
        });
    });
  }

  public updateRemoteApi = (): Promise<void> => {
    return this._attemptUpdateRemoteAPI();
  }

updateRemoteApi()
.catch(error => console.log('error: ', error));

}