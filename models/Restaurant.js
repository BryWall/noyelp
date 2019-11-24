const mongoose = require('mongoose');
const mongoosastic = require('mongoosastic');
const Schema = mongoose.Schema;


let RestaurantSchema = new Schema({
    name: {
        type: String,
        es_indexed: true,
        es_fields : {
            ngram: { type: 'text', analyzer: 'ngram_analyzer', index: 'analyzed'},
            keyword: { type: 'text', analyzer: 'keyword_analyzer', index: 'analyzed'}
        }
    },
    zipCode: { type: Number, es_indexed: true },
    neighborhood: {
        type: String,
        es_indexed: true,
        es_fields : {
            ngram: { type: 'text', analyzer: 'ngram_analyzer', index: 'analyzed'},
            keyword: { type: 'text', analyzer: 'keyword_analyzer', index: 'analyzed'}
        }
    },
    location: {
        type: String,
        es_indexed: true,
        es_fields : {
            ngram: { type: 'text', analyzer: 'ngram_analyzer', index: 'analyzed'},
            keyword: { type: 'text', analyzer: 'keyword_analyzer', index: 'analyzed'}
        }
    }
});

RestaurantSchema.plugin(mongoosastic);

const Restaurant = mongoose.model('Restaurant', RestaurantSchema);

Restaurant.createMapping({
    analysis : {
        filter : {
            ngram_filter: {
                type: 'nGram',
                min_gram : 3,
                max_gram : 10,
                token_chars : [
                    'letter', 'digit', 'symbol', 'punctuation'
                ]
            }
        },
        analyzer : {
            ngram_analyzer : {
                type: 'custom',
                tokenizer: 'whitespace',
                filter : [
                    'lowercase',
                    'asciifolding',
                    'ngram_filter'
                ]
            },
            keyword_analyzer : {
                tokenizer : 'standard',
                filter: [
                    'lowercase',
                    'asciifolding'
                ]
            }
        }
    }
}, (err, mapping) => {
    if(err)
        return console.log(err);

    console.log(mapping);
});

const stream = Restaurant.synchronize();
let count = 0;

stream.on('data', (err, doc) => count++);
stream.on('close', () => console.log(`Indexed ${count} documents`));
stream.on('error', (err) => console.log(err));

module.exports = Restaurant;