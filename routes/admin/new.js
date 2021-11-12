const express = require("express");
var router = express.Router({ mergeParams: true }),
    Admin = require("../../models/admin"),
    puppeteer =require("puppeteer"),
    path=require("path"),
    Order=require("../../models/order"),
    Customer=require("../../models/customer"),
    Iphone=require("../../models/iphone"),
    Iwatch = require("../../models/iwatch"),
    {nodemailerSendEmailAll}=require("../../nodemailer/nodemailer.js"),
    {sendSmsAll}=require("../../msg91/sendmsg"),
    Ipod = require("../../models/ipod");
    fs=require("fs"),
    ejs=require("ejs"),
    shell=require("shelljs"),
    { f1aNew, f2aNew, f3aNew, f4aNew, f5aNew} = require("../../controllers/admin/new"),
    { isAdmin } = require("../../middleware/index");


// @route to get new invoice
router.post("/",isAdmin, f1aNew);

// @route to new invoice page
router.get("/:oid",isAdmin, f2aNew);

// @route to add product to invoice
router.post("/add/:oid",isAdmin, f3aNew);

// @route to edit product to invoice
router.post("/edit/:oid/:pid",isAdmin, f4aNew);

// @route to delete product to invoice
router.get("/delete/:oid/:pid",isAdmin, f5aNew);

// // @route to vouchers page
// router.get("/vouchers",isAdmin,f6aNew);

// @route to print-pdf
router.post("/create-pdf/:oid",isAdmin,(req, res) => {
    if (req.params.oid.match(/^[0-9a-fA-F]{24}$/)) {
        Order.findOne({ _id: req.params.oid, isOnline: false }).populate("customer").exec((err, order) => {
            if (err) {
                console.log(err)
                req.flash("error", "Database Error")
                res.redirect("back")
            } else {
                // 
                if (order) {
                    if(order.isPaid){
                       res.redirect("/allorders")
                    }else{
                        order.products1.forEach((p)=>{
                            if(p.product=="1"){
                                Iphone.findOne({pid:p.product_id},(err,phone)=>{
                                    if(err){
                                        res.redirect("/")
                                    }else{
                                        if(phone){
                                            phone.variants.forEach((v)=>{
                                                if(v.storage==p.desc){
                                                    // order.my_price = p.my_price;
                                                    v.quantity-=p.quantity;
                                                }
                                            })
                                            phone.save()
                                        }
                                    }
                                })
                            }else if(p.product=="2"){
                                Iwatch.findOne({pid:p.product_id},(err,phone)=>{
                                    if(err){
                                        res.redirect("/")
                                    }else{
                                        if(phone){
                                            phone.variants.forEach((v)=>{
                                                var desc=v.type+","+v.size;
                                                if(desc==p.desc){
                                                    // order.my_price = p.my_price;
                                                    v.quantity-=p.quantity;
                                                }
                                            })
                                            phone.save()
                                        }
                                    }
                                })
                            }else{
                                Ipod.findOne({pid:p.product_id},(err,phone)=>{
                                    if(err){
                                        res.redirect("/")
                                    }else{
                                        if(phone){
                                            // order.my_price = p.my_price;
                                            phone.quantity-=p.quantity;
                                            phone.save()
                                        }
                                    }
                                })
                            }
                        })
                        order.payment_type = req.body.payment_type;
                        order.advance = Number(req.body.advance);
                        order.customer.name=req.body.username;
                        order.customer.city=req.body.city;
                        order.discount=Number(req.body.discount);
                        order.total_paid=(order.total-(order.total*0.01*order.discount)).toFixed(2);
                        order.isPaid=true;
                        if(!order.customer.bills.includes(order._id)){
                            console.log("domne")
                            order.customer.bills.push(order._id)
                        }
                        if(order.advance>=order.total_paid){
                            if(!order.customer.paidbills.includes(order._id)){
                                console.log("domne")
                                order.customer.paidbills.push(order._id)
                            }
                        }else{
                            if(order.customer.paidbills.includes(order._id)){
                               order.customer.paidbills=order.customer.paidbills.filter((b)=>{
                                   return b!=order._id;
                               })
                            } 
                        }
                        Admin.findOne({},(err,admin)=>{
                            var mail=[],sms=[],str="";
                            order.products1.forEach((p)=>{
                                str+=" <tr>"+
                                "<td>"+p.name+"</td>"+
                                "<td>"+p.desc+"</td>"+
                                "<td>"+p.quantity+"</td>"+
                                "<td>"+p.price+"</td>"+
                            "</tr>";
                            })
                            mail.push({
                                mail: admin.email,
                                sub: "New Offline Order Placed",
                                html:"<p><b>New Offline Order</b></p>"+
                                     "<p>BillNo:"+order.billno+"</p>"+
                                     "<p>Customer:"+order.customer.name+"</p>"+
                                     "<p>Mobile No:"+order.customer.mobile+"</p>"+
                                     "<p>Order Amount:"+order.total_paid+"</p>"+
                                     "<table>"+
                                     "<thead>"+
                                         "<th>Product</th>"+
                                         "<th>Description</th>"+
                                         "<th>Quantity</th>"+
                                         "<th>Amount</th>"+
                                     "</thead>"+
                                     "<tbody>"+
                                        str+
                                     "</tbody>"+
                                 "</table>"
                            })
                            mail.push({
                                mail: "ankit@stickmanservices.com",
                                sub: "New Offline Order Placed",
                                html:"<p><b>New Offline Order</b></p>"+
                                     "<p>BillNo:"+order.billno+"</p>"+
                                     "<p>Customer:"+order.customer.name+"</p>"+
                                     "<p>Mobile No:"+order.customer.mobile+"</p>"+
                                     "<p>Order Amount:"+order.total_paid+"</p>"+
                                     "<table>"+
                                     "<thead>"+
                                         "<th>Product</th>"+
                                         "<th>Description</th>"+
                                         "<th>Quantity</th>"+
                                         "<th>Amount</th>"+
                                     "</thead>"+
                                     "<tbody>"+
                                        str+
                                     "</tbody>"+
                                 "</table>"
                            })
                            sms.push({
                                mobile: order.customer.mobile,
                                message: "Thank You for your purchase of Amount- "+order.total_paid+" at Marvans Mobile.Hope you visit soon."
                            })
                            sms.push({
                                mobile: admin.mobile,
                                message: "There is a new offline order placed with billNo: " + order.billno+"\n" +"Customer: "+order.customer.name+" Mobile: "+order.customer.mobile+" Total Amount: "+order.total_paid+ ".\nPlease visit the admin panel for more details."
                            })
                            nodemailerSendEmailAll(mail, (res) => {
                                console.log(res);
                                console.log("hello");
                            });
                            console.log("admin")
                            sendSmsAll(sms);
                        })
                        order.customer.save();
                        order.save((err) => {
                            if (err) {
                                console.log(err)
                                req.flash("error", "Database Error")
                                res.redirect("back")
                            } else {
                                // console.log(order.products1[0]._id)
    
                                createPDF(order,res,req);
                                
                            }
                        })
                    }
                 


                } else {
                    console.log("k")
                    req.flash("error", "Invalid order")
                    res.redirect("back")
                }
            }
        })
    } else {
        console.log("k")
        req.flash("error", "Invalid URL")
        res.redirect("/")
    }

})






// function to generate pdf
async function createPDF( bill, res,req) {

    var templateEjs = fs.readFileSync(path.join(process.env.PWD, "views","admin", 'pdf.ejs'), 'utf8');
    var template = ejs.compile(templateEjs);
    var html = template({ bill: bill });
    
    var dir = './bills/';

    if (!fs.existsSync(dir)) {
        shell.mkdir('-p', dir);
    }
    var pdfPath = path.join(process.env.PWD,'bills','bill.pdf');

    var options = {
		// width: '1384px',
		// height: '1012px',
		// landscape: true,
        displayHeaderFooter: false,
        format:'A4',
		margin:"none",
		printBackground: true,
		path: pdfPath
	}

    const browser = await puppeteer.launch({
        args: ['--no-sandbox'],
        headless: true
    });

    var page = await browser.newPage();
    await page.setContent(html);
    await page.waitFor('*');
    await page.pdf(options);
    await browser.close();
    var readStream = fs.createReadStream(pdfPath);
    readStream.pipe(res);
    // res.redirect("/products")
    // res.render("bill1",{bill:bill})
    // await res.download(pdfPath,customer.cref+'-'+bill.billno+'.pdf');
}






module.exports = router;