const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

// Create Connection
const db = mysql.createConnection({
    host : 'localhost',
    user: 'debug',
    password : 'debug',
    database: 'store'
});
db.connect((err)=>{
    if(err){
        throw err;
    }
    console.log("MYSQL Connected");
});

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 3000;

var router = express.Router();

router.use(function(req, res, next) {
    console.log('Request ............');
    next();
});


router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });   
});

app.use('/api', router);


app.get('/api/customers', function (req, res) {
    db.query('select * from customers', function (error, results, fields) {
    if (error) throw error;
    res.end(JSON.stringify(results));
  });
 });

app.post('/api/logincustomer', function (req, res) {
    var data={
        userName: req.body.userName,
        userPassword: req.body.userPassword
    }
    db.query('SELECT * from customers WHERE username=? and password=?',[data.userName, data.userPassword], function (error, results, fields) {        
        if (error){
            throw error;
           }
           else{
            if(results.length<1){
                res.json({ message: 'false' });
                res.end();
            }else{
                res.json({ message: 'true' ,details:JSON.parse(JSON.stringify(results[0]))});
                res.end();
            }
           }
  });
 });

 app.post('/api/getcustomerinfo', function (req, res) {
    var data={
        userName: req.body.userName
    }
    db.query('SELECT * from customers WHERE username=?',[data.userName], function (error, results, fields) {
        if (error){
            throw error;
           }
           else{
            if(results.length<1){
                res.json({ message: 'false' });
                res.end();
            }else{
                res.json({ message: 'true' ,details:JSON.parse(JSON.stringify(results[0]))});
                res.end();
            }
           }
  });
 });

 app.post('/api/getProductImage', function (req, res) {
    var data={
        productID: req.body.productID
    }
    db.query('SELECT productImage from products WHERE productID=?',[data.productID], function (error, results, fields) {
        if (error){
            throw error;
           }
           else{
            if(results.length<1){
                res.json({ message: 'false' });
                res.end();
            }else{
                var buffer = new Buffer( results[0].productImage, 'binary' );
                var bufferBase64 = buffer.toString('base64').trim();
                res.json({ message: 'true' ,details:bufferBase64});
                res.end();
            }
           }
  });
 });


 app.post('/api/customercheckout', function (req, res) {
    var data={
        userName: req.body.userName
    }
    db.query('UPDATE activeCustomers SET userCheckout=? WHERE username=?',[1,data.userName], function (error, results, fields) {
        if (error){
            throw error;
           }
           else{
            if(results.length<1){
                res.json({ message: 'false' });
                res.end();
            }else{
                res.json({ message: 'true'});
                res.end();
            }
           }
  });
 });

 app.post('/api/updateCheckout', function (req, res) {
    var data={
        userName: req.body.userName
    }
    db.query('UPDATE activeCustomers SET staffCheckout=?, userCheckout=? WHERE username=?',[0,0,data.userName], function (error, results, fields) {
        if (error){
            throw error;
           }
           else{
            if(results.length<1){
                res.json({ message: 'false' });
                res.end();
            }else{
                res.json({ message: 'true'});
                res.end();
            }
           }
  });
 });

  app.post('/api/staffcheckout', function (req, res) {
    var data={
        userName: req.body.userName
    }
    db.query('SELECT staffCheckout FROM activeCustomers WHERE username=?',[data.userName], function (error, results, fields) {
        if (error){
            throw error;
           }
           else{
            if(results.length<1){
                res.json({ message: 'false' });
                res.end();
            }else{
                res.json({ message: 'true',status:results});
                res.end();
            }
           }
  });
 });


 app.post('/api/getCartData', function (req, res) {
    var data={
        userName: req.body.userName
    }
    db.query('SELECT * from productOnCart WHERE username=?',[data.userName], function (error, results, fields) {
        if (error){
            throw error;
           }
           else{
            if(results.length<1){
                res.json({ message: 'false' });
                res.end();
            }else{
                res.json({ message: 'true' ,cartData:results});
                res.end();
            }
           }
  });
 });

 app.post('/api/getCheckoutBill', function (req, res) {
    var data={
        userName: req.body.userName
    }
    db.query('SELECT * from checkoutBill WHERE username=?',[data.userName], function (error, results, fields) {
        if (error){
            throw error;
           }
           else{
            if(results.length<1){
                res.json({ message: 'false' });
                res.end();
            }else{
                res.json({ message: 'true' ,billData:results});
                res.end();
            }
           }
  });
 });

 app.post('/api/getProductQuantity', function (req, res) {
    var data={
        productID: req.body.productID
    }
    db.query('SELECT productquantity from products WHERE productID=?',[data.productID], function (error, results, fields) {
        if (error){
            throw error;
           }
           else{
            if(results.length<1){
                res.json({ message: 'false' });
                res.end();
            }else{             
                res.json({ message: 'true' ,productQuantity:results[0]});
                res.end();
            }
           }
  });
 });

app.post('/api/registercustomer', function (req, res) {
    var data = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        userName: req.body.userName,
        userEmail: req.body.userEmail,
        userAddress: req.body.userAddress,
        phoneNumber: req.body.phoneNumber,
        userGender: req.body.userGender,
        userPassword: req.body.userPassword
     };
     db.query('SELECT username FROM customers WHERE username=? OR email=?',
     [data.userName,data.userEmail], function (error, results, fields) {
        
        if (error){
            throw error;
           }
           else{
            if(results.length>=1){
                res.json({ valid: 'false',message:'Username or email already exists' });
            }else{
                db.query('INSERT INTO customers(first_name,last_name,username,email,address,phone_number,gender,password) VALUES(?,?,?,?,?,?,?,?)',
                [data.firstName,data.lastName,data.userName,data.userEmail,data.userAddress,data.phoneNumber,data.userGender,data.userPassword], function (error, results, fields) {
                   
                    if (error){
                    res.json({ valid: 'false' });
                    res.end();
                    throw error;
                   }
                   else{
                    res.json({ valid: 'true' });
                    res.end();
                   }
                 });
            }
           }

      });
 });

 app.post('/api/addtocart', function (req, res) {
    var data = {
        userName: req.body.userName,
        productOnCartID: req.body.productOnCartID,
        productName: req.body.productName,
        productID: req.body.productID,
        productCat: req.body.productCat,        
        productSize: req.body.productSize,        
        productBrand: req.body.productBrand,
        productColor: req.body.productColor,
        productPrice: req.body.productPrice,
        productDesc: req.body.productDesc,
        productQuantity: req.body.productQuantity,
        productAddedDateTime: req.body.productAddedDateTime,
        productImage: req.body.productImage
     };
     db.query(`INSERT INTO productOnCart(userName,productOnCartID,productName,productID,productCat,productSize,productBrand,productColor,productPrice,productDesc,
        productQuantity,productAddedDateTime,productImage) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [data.userName,data.productOnCartID,data.productName,data.productID,data.productCat,data.productSize,data.productBrand,data.productColor,data.productPrice,data.productDesc,data.productQuantity,data.productAddedDateTime,data.productImage], function (error, results, fields) {

        if (error){
        res.json({ message: 'false' });
        res.end();
        throw error;
       }
       else{
        db.query("SELECT productquantity FROM products WHERE productID=?", [data.productID], function (err, selectresult, fields) {
            if (err) throw err;
            else{
                var updatedQuantity = selectresult[0].productquantity-data.productQuantity; 
                db.query(`UPDATE products SET productquantity=? WHERE productID=?`,
                [updatedQuantity,data.productID], function (error, updatedresults, fields) {
                    if (error){
                    res.json({ message: 'false' });
                    res.end();
                    throw error;
                   }
                   else{
                    res.json({ message: 'true' });
                    res.end();
                   }
                 });
            }
          });
       }
     });
 });


 app.post('/api/removeFromCart', function (req, res) {
    var data = {
        productOnCartID: req.body.productOnCartID,
        productID: req.body.productID,
        productQuantity: req.body.productQuantity
     };       
        db.query(`DELETE FROM productOnCart WHERE productOnCartID=?`,
        [data.productOnCartID], function (error, results, fields) {
        if (error){
        res.json({ message: 'false' });
        res.end();
        throw error;
       }
       else{
        db.query("SELECT productquantity FROM products WHERE productID=?", [data.productID], function (err, selectresult, fields) {
            if (err) throw err;
            else{
                var updatedQuantity = parseInt(selectresult[0].productquantity)+parseInt(data.productQuantity);
                db.query(`UPDATE products SET productquantity=? WHERE productID=?`,
                [updatedQuantity,data.productID], function (error, updatedresults, fields) {
                    if (error){
                    res.json({ message: 'false' });
                    res.end();
                    throw error;
                   }
                   else{
                    res.json({ message: 'true' });
                    res.end();
                   }
                 });
            }
          });
       }
     });
 });


// START THE SERVER
app.listen(port, ()=>{
    console.log('Server Started on port 3000');
});