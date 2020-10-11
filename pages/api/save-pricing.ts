import * as Joi from '@hapi/joi'
import * as fs from 'fs';

// This is the JOI validation schema, you define
// all the validation logic in here, then run
// the validation during the request lifecycle.
// If you prefer to use your own way of validating the 
// incoming data, you can use it.
type MatrixType = import('../../types').Matrix;
// const schema = Joi.object<import('../../types').Matrix>({
//    matrix: Matrix
// })

// Build validation manually, cannot directly add type as joi object
const schema = Joi.object().keys({
  "36months": Joi.object({
    lite: Joi.number(),
    standard: Joi.number(),
    unlimited: Joi.number()
  }),
  "24months": Joi.object({
    lite: Joi.number(),
    standard: Joi.number(),
    unlimited: Joi.number()
  }),
  "12months": Joi.object({
    lite: Joi.number(),
    standard: Joi.number(),
    unlimited: Joi.number()
  }),
  "mtm": Joi.object({
    lite: Joi.number(),
    standard: Joi.number(),
    unlimited: Joi.number()
  })
})

export default async (req: import('next').NextApiRequest, res: import('next').NextApiResponse) => {
  try {
    // This will throw when the validation fails
    const data = await schema.validateAsync(req.body, {
      abortEarly: false
    }) //as import('../../types').Matrix

    // Write the new matrix to public/pricing.json
    const strData = JSON.stringify(data, null, 2);

    fs.writeFile('public/pricing.json', strData, (err) => {
        if (err) throw err;
        console.log('Data written to file');
    });

    res.statusCode = 200
    res.json(data)
  } catch(e) {
    if(e.isJoi) {
      console.log('joi error>>', e.details)
      // Handle the validation error and return a proper response
      res.statusCode = 422
      // res.end('Error')
      res.json({ error: e.details[0].message })
    }
    else {
      res.statusCode = 500
      res.json({ error: 'Unknown Error' })
    }    
  }
}