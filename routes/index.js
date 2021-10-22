const { enabled } = require('debug');
var express = require('express');
var router = express.Router();

var dataBike = [
  {name:"BIK045", url:"/images/bike-1.jpg", price:679},
  {name:"ZOOK07", url:"/images/bike-2.jpg", price:999},
  {name:"TITANS", url:"/images/bike-3.jpg", price:799},
  {name:"CEWO", url:"/images/bike-4.jpg", price:1300},
  {name:"AMIG039", url:"/images/bike-5.jpg", price:479},
  {name:"LIK099", url:"/images/bike-6.jpg", price:869},
]


/* GET home page. */
router.get('/', function(req, res, next) {

  if(req.session.dataCardBike == undefined){
    req.session.dataCardBike = []
  }
  
  res.render('index', {dataBike:dataBike});
});

router.get('/shop', function(req, res, next) {

  var alreadyExist = false;

  for(var i = 0; i< req.session.dataCardBike.length; i++){
    if(req.session.dataCardBike[i].name == req.query.bikeNameFromFront){
      req.session.dataCardBike[i].quantity = Number(req.session.dataCardBike[i].quantity) + 1;
      alreadyExist = true;
    }
  }

  if(alreadyExist == false){
    req.session.dataCardBike.push({
      name: req.query.bikeNameFromFront,
      url: req.query.bikeImageFromFront,
      price: req.query.bikePriceFromFront,
      quantity: 1
    })
  }


  res.render('shop', {dataCardBike:req.session.dataCardBike});
});

router.get('/delete-shop', function(req, res, next){
  
  req.session.dataCardBike.splice(req.query.position,1)

  res.render('shop',{dataCardBike:req.session.dataCardBike})
})

router.post('/update-shop', function(req, res, next){
  
  var position = req.body.position;
  var newQuantity = req.body.quantity;

  req.session.dataCardBike[position].quantity = newQuantity;

  res.render('shop',{dataCardBike:req.session.dataCardBike})
})

const stripe = require('stripe')('sk_test_51JnJa9Esh9oBZ4aX7eAHlO36xrYhUGRDov9Kh62vXpXF83UdBRm0NyVsIoPdkldLZce2w2g2NJtijOeGEE62HMRP0069JGu6pG')


router.post('/create-checkout-session', async (req, res) => {
  
  let order = [];
  for(var i=0; i<req.session.dataCardBike.length; i++){
    order.push({
      price_data: {
        currency: 'eur',
        product_data: {
          name: req.session.dataCardBike[i].name,
        },
        unit_amount: req.session.dataCardBike[i].price*100,
      },
      quantity: req.session.dataCardBike[i].quantity,
    },
    );
  }
   
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: order,


    mode: 'payment',
    allow_promotion_codes: true,
    success_url: 'http://localhost:3000/success',
    cancel_url: 'http://localhost:3000/cancel',
  });

  res.redirect(303, session.url);
});

router.get('/success', function(req, res, next){
  req.session.dataCardBike=[];
  res.render('shop', {dataCardBike:req.session.dataCardBike})
});

router.get('/cancel', function(req, res, next){
  res.render('shop', {dataCardBike:req.session.dataCardBike})
});


module.exports = router;
