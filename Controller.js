

//Endpoints
const REMOTE_RESOURCE_1_URL = 'http://example.com/api/resource1'
const REMOTE_RESOURCE_2_URL = 'http://example.com/api/resource2'

//store related data
const data = {
    previous_data:[{ value: 'old data' }],
    new_data1:[{ value: 'new data 1' }],
    new_data2:[{ value: 'new data 2' }]
  };

//re-usable fetch
const fetch_retry = async (url, options, n) => {
    try {
        return await fetch(url, options)
    } catch(err) {
        if (n === 1 || retry < 1) throw err;
        console.log('there was an error sending data: ', err);
        return await fetch_retry(url, options, n - 1);
    }
};


const attemptUpdateRemoteAPI = ()=> {
    var { data } = this
    
    return this.fetch_retry(REMOTE_RESOURCE_1_URL, data.new_data1, 3)
    .then(response => {
        //Do a response check in case REMOTE_RESOURCE_2_URL entirely depends on REMOTE_RESOURCE_1_URL's response(make sure there is data)
        if(response.ok && response.data.length > 0){
            return this.fetch_retry(REMOTE_RESOURCE_2_URL, data.new_data2, 3)
        }
        //response was empty/bad, we need to abort;
        else
        {
            console.log(err, 'empty/bad response...');
        }
    })
    .catch(err => {
        console.log(err, 'Second resource failed, rolling back to 1st resource...');
        return fetch_retry(REMOTE_RESOURCE_2_URL, data.new_data2, 3)
    });

}

const updateRemoteApi = () => {
  return this.attemptUpdateRemoteAPI();
}

this.updateRemoteApi()
.catch(err => console.log('there was an err: ', err));