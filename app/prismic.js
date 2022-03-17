const axios = require('axios');

const getMasterRef = (prismicConfig) => {
    return axios({
        method: 'get',
        url: prismicConfig.endpoint,
        params: {
            'access_token': prismicConfig.accessToken,
        },
    })
    .then(res => {
        for (const refData of res.data.refs) {
            if (refData.isMasterRef) {
                return refData.ref;
            }
        }

        throw new Error('could not find ref for master');
    });
}

const getDocument = (prismicConfig, uid) => {
    return getMasterRef(prismicConfig)
    .then(masterRef => {
        return axios({
            method: 'get',
            url: `${prismicConfig.endpoint}/documents/search`,
            params: {
                'access_token': prismicConfig.accessToken,
                'ref': masterRef,
                'lang': '*',
                'q': `[[at(my.product.uid, "${uid}")]]`
            },
        })
    })
    .then(res => {
        if (res.data.results_size === 0) {
            return { status: 404, result: 'not found' };
        }

        return { status: 200, result: res.data.results[0] };
    })
    .catch(err => {
        return { status: 500, err };
    })
};

module.exports = {
    getDocument,
};
