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
    console.log("MySQl Connected");
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
        userName: req.body.userName,
        paymentmethod: req.body.paymentmethod        
    }
    db.query('UPDATE activeCustomers SET userCheckout=? , paymentmethod=? WHERE username=?',[1,data.paymentmethod,data.userName], function (error, results, fields) {
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
    db.query('DELETE FROM activeCustomers WHERE username=?',[data.userName], function (error, results, fields) {
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

 app.post('/api/getOrderData', function (req, res) {
    var data={
        userName: req.body.userName
    }
    db.query('SELECT * from orders INNER JOIN products ON orders.productID = products.productID WHERE username=?',[data.userName], function (error, results, fields) {
        if (error){
            throw error;
           }
           else{
            if(results.length<1){
                res.json({ message: 'false' });
                res.end();
            }else{
                res.json({ message: 'true' ,orderData:results});
                res.end();
            }
           }
    });
 });


 app.post('/api/getProductInfo', function (req, res) {
    var data={
        productID: req.body.productID
    }
    db.query('SELECT * from products WHERE productID=?',[data.productID], function (error, results, fields) {
        if (error){
            throw error;
           }
           else{
            if(results.length<1){
                res.json({ message: 'false' });
                res.end();
            }else{
                res.json({ message: 'true' ,productInfo:results});
                res.end();
            }
           }
  });
 });

 Array.prototype.contains = function(element){
    return this.indexOf(element) > -1;
};

 app.post('/api/getrecommendedProducts', function (req, res) {
    var data={
        userName: req.body.userName
    }
    db.query('SELECT * from productOnCart WHERE userName="anup"', function (error, currentProduct, fields) {
        if (error){
            throw error;
           }
           else{
            if(currentProduct.length<1){              
                db.query('SELECT * from sales INNER JOIN products ON sales.productID = products.productID WHERE username="anup"',[data.userName], function (error, salesResults, fields) {
                    if (error){
                        throw error;
                       }
                       else{
                        if(salesResults.length<1){
                            // from sale product
                            console.log("FROM SALE");
                            db.query('SELECT saleProducts.productID,saleProducts.salePrice, products.productname, products.productprice from saleProducts INNER JOIN products ON saleProducts.productID = products.productID', function (error, saleResults, fields) {
                                if (error){
                                    throw error;
                                   }
                                   else{
                                    if(saleResults.length<1){
                                        res.json({ message: 'false' });
                                        res.end();
                                    }else{
                                        console.log(saleResults);
                                        res.json({ message: 'true', type:'sale' ,recommendedProducts:saleResults});
                                        res.end();
                                    }
                                }
                            });
                        }else{
// from sales
                            console.log("FROM SALES");
                            var recommendedProducts = [];
                            var recommendedProductsID = [];                
                            var flag=1;
                            salesResults.forEach(element => {
            
                                var bestScore = 0;
                                db.query('SELECT productID,productname,productdesc,productsize,productcategory,productcolor,productbrand,productprice,productquantity from products', function (error, otherProduct, fields) {
                                    if (error){
                                        throw error;
                                        }
                                        else{
                                        if(otherProduct.length<1){
                                            res.json({ message: 'false' });
                                            res.end();
                                        }else{
                                            console.log("For: "+element.productname);
                                            console.log(otherProduct);
                                            for (var j in otherProduct) {
            
                                                var matchScore = 0;
                                                console.log("For "+otherProduct[j].productname);
                                                if(element.productbrand == otherProduct[j].productbrand){
                                                    matchScore++;
                                                    console.log("Brand");
                                                    console.log(element.productbrand);
                                                    console.log(matchScore);
                                                }
                                                if(element.productcategory == otherProduct[j].productcategory){
                                                    console.log("Cat");
                                                    console.log(element.productcategory);
                                                    matchScore++;
                                                    console.log(matchScore);                                      
                                                }
                                                if(element.productcolor == otherProduct[j].productcolor){
                                                    console.log("Color");
                                                    console.log(element.productcolor);
                                                    matchScore++;
                                                    console.log(matchScore);                                
                                                }
                                                if(element.productname != otherProduct[j].productname){
                                                    if(!recommendedProductsID.contains(otherProduct[j].productID)){
                                                        
                                                        if(recommendedProductsID.length > 11){
                                                            if((matchScore > bestScore) && (matchScore != 0)){
                                                                console.log("match: "+matchScore);
                                                                console.log("best: "+bestScore);                                    
                                                                bestScore = matchScore;
                                                                recommendedProducts.push(otherProduct[j]);                             
                                                                recommendedProductsID.push(otherProduct[j].productID);                                                
                                                            }
                                                        }
                                                        else{
                                                            if((matchScore >= bestScore) && (matchScore != 0)){
                                                                console.log("match: "+matchScore);
                                                                console.log("best: "+bestScore);                                    
                                                                bestScore = matchScore;
                                                                recommendedProducts.push(otherProduct[j]);                                                           
                                                                recommendedProductsID.push(otherProduct[j].productID);                                                
                                                            }
                                                        }
                                                        
                                                    }
                                                }
                                            }
                                            if(flag==salesResults.length){
                                                console.log("Final Reults");
                                                console.log(recommendedProducts);
                                                res.json({ message: 'true', type:'recommended' ,recommendedProducts:recommendedProducts});                
                                                res.end();
                                            }
                                            flag++; 
                                        }
                                    }
                               });
                               
                            });
                        }
                    }
                });

            }else{       
                // items exist on cart so recommend same products
                console.log("FROM CART");                
                var recommendedProducts = [];
                var recommendedProductsID = [];                
                var flag=1;
                currentProduct.forEach(element => {

                    var bestScore = 0;
                    db.query('SELECT productID,productname,productdesc,productsize,productcategory,productcolor,productbrand,productprice,productquantity from products', function (error, otherProduct, fields) {
                        if (error){
                            throw error;
                            }
                            else{
                            if(otherProduct.length<1){
                                res.json({ message: 'false' });
                                res.end();
                            }else{
                                console.log("For: "+element.productName)
                                
                                for (var j in otherProduct) {

                                    var matchScore = 0;
                                    console.log("For "+otherProduct[j].productname);
                                    if(element.productBrand == otherProduct[j].productbrand){
                                        matchScore++;
                                        console.log("Brand");
                                        console.log(element.productBrand);
                                        console.log(matchScore);
                                    }
                                    if(element.productCat == otherProduct[j].productcategory){
                                        console.log("Cat");
                                        console.log(element.productCat);
                                        matchScore++;
                                        console.log(matchScore);                                      
                                    }
                                    if(element.productColor == otherProduct[j].productcolor){
                                        console.log("Color");
                                        console.log(element.productColor);
                                        matchScore++;
                                        console.log(matchScore);                                
                                    }
                                    if(element.productName != otherProduct[j].productname){
                                        if(!recommendedProductsID.contains(otherProduct[j].productID)){
                                            
                                            if(recommendedProductsID.length > 11){
                                                if((matchScore > bestScore) && (matchScore != 0)){
                                                    console.log("match: "+matchScore);
                                                    console.log("best: "+bestScore);                                    
                                                    bestScore = matchScore;
                                                    recommendedProducts.push(otherProduct[j]);
                                                    recommendedProductsID.push(otherProduct[j].productID);                                                
                                                }
                                            }
                                            else{
                                                if((matchScore >= bestScore) && (matchScore != 0)){
                                                    console.log("match: "+matchScore);
                                                    console.log("best: "+bestScore);                                    
                                                    bestScore = matchScore;
                                                    recommendedProducts.push(otherProduct[j]);
                                                    recommendedProductsID.push(otherProduct[j].productID);                                                
                                                }
                                                else{
                                                    //match score is zero so recommend from products
                                                     
                                                }
                                            }
                                            
                                        }
                                    }
                                }
                                if(flag==currentProduct.length){
                                    console.log(recommendedProducts);
                                    if(recommendedProducts.length == 0){

                                    }else{
                                        res.json({ message: 'true', type:'recommended' ,recommendedProducts:recommendedProducts});                
                                        res.end();
                                    }
                                }
                                flag++; 
                            }
                        }
                   });
                   
                });
                
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
        productImage: req.body.productImage,
        time: req.body.time,
        homedelivery: req.body.homedelivery
     };
     console.log(data.homedelivery)
     db.query(`SELECT productID FROM productOnCart WHERE productID=? and homedelivery=?`,[data.productID,data.homedelivery],function (error, existID, fields) {
        if (error) throw error;
        else{
            if(existID.length < 1){
                db.query(`INSERT INTO productOnCart(userName,productOnCartID,productName,productID,productCat,productSize,productBrand,productColor,productPrice,productDesc,
                    productQuantity,productAddedDateTime,productImage,time,homedelivery) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                [data.userName,data.productOnCartID,data.productName,data.productID,data.productCat,data.productSize,data.productBrand,data.productColor,data.productPrice,data.productDesc,data.productQuantity,data.productAddedDateTime,data.productImage,data.time,data.homedelivery], function (error, results, fields) {
            
                    if (error){
                    res.json({ message: 'false' });
                    res.end();
                    throw error;
                   }
                   else{
            
                    db.query("INSERT into activeCustomers(username,userCheckout,staffCheckout,paymentmethod) VALUES(?,?,?,?) ON DUPLICATE KEY UPDATE username=?", [data.userName, 0, 0,"cash",data.userName], function (err, selectresult, fields) {
                        if (err) throw err;
                        console.log("user inserted to active list")
                    });
            
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
            }
            else{
                 db.query("SELECT productQuantity,productPrice FROM productOnCart WHERE productID=?", [data.productID], function (err, selectresults, fields) {
                        if (err) throw err;
                        else{
                            var updateQ = selectresults[0].productQuantity + data.productQuantity;
                            var updateP = parseInt(selectresults[0].productPrice) + (data.productQuantity * parseInt(data.productPrice));
                            console.log(selectresults[0]);
                            console.log(updateQ);
                            console.log(updateP);
                db.query(`UPDATE productOnCart SET productQuantity=? , productPrice=? WHERE productID=?`,
                [updateQ,updateP,data.productID], function (error, results, fields) {
            
                    if (error){
                    res.json({ message: 'false' });
                    res.end();
                    throw error;
                   }
                   else{
                    console.log("cart updated");
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
                }
                });
            }
        }
     });
    
 });


 app.post('/api/removeFromCart', function (req, res) {
    var data = {
        productOnCartID: req.body.productOnCartID,
        productID: req.body.productID,
        productQuantity: req.body.productQuantity,
        userName: req.body.userName        
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

                    db.query('SELECT * from productOnCart WHERE username=?',[data.userName], function (error, sresults, fields) {
                        if (error){
                            throw error;
                           }
                           else{
                            if(sresults.length<1){
                                db.query('DELETE FROM activeCustomers WHERE username=?',[data.userName], function (error, dresults, fields) {
                                    if (error){
                                        res.json({ message: 'false' });
                                        res.end();
                                        throw error;
                                       }else{
                                           console.log("user removed");
                                            res.json({ message: 'true'});
                                            res.end();
                                       }
                              });
                            }else{
                                res.json({ message: 'true'});
                                res.end();
                            }
                           }
                  });
                    
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