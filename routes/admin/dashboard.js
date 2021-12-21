const express = require("express");
const { f10aDash } = require("../../controllers/admin/dashboard");
var router = express.Router({ mergeParams: true }),
  Admin = require("../../models/admin"),
  nameCity = require("../../models/nameCity");
(puppeteer = require("puppeteer")),
  (path = require("path")),
  (Order = require("../../models/order")),
  (Customer = require("../../models/customer")),
  (fs = require("fs")),
  (ejs = require("ejs")),
  (shell = require("shelljs")),
  ({
    f1aDash,
    f2aDash,
    f3aDash,
    f4aDash,
    f5aDash,
    f6aDash,
    f7aDash,
    f8aDash,
    f9aDash,
    f11aDash,
    f12aDash,
    f13aDash,
    f14aDash,
    f15aDash,
    f16aDash,
    f17aDash,
    f18aDash,
  } = require("../../controllers/admin/dashboard")),
  ({ isAdmin } = require("../../middleware/index"));

// Order.find({isPaid:true,isOnline:true},(err,orders)=>{
//     orders.forEach((o)=>{
//       console.log(convertDate(o.order_date))
//     })
// })
// @route to get dashboard
router.get("/orders/:type", isAdmin, f1aDash);

// @route to customer list
router.get("/customerlist", isAdmin, f2aDash);

// route to post orders history for a customer
router.post("/history", isAdmin, f3aDash);

// @route to show order history
router.get("/history/:cid", isAdmin, f4aDash);

// @route to pay the bill
router.get("/paid/:oid", isAdmin, f5aDash);

// @route to delete order
router.get("/order/delete/:oid", isAdmin, f6aDash);

// @route to vouchers page
router.get("/vouchers", isAdmin, f7aDash);

// @route to reports page
router.get("/report", isAdmin, f8aDash);

// @route to report invoice page
router.get("/invoices/:date", isAdmin, f9aDash);

// ======= new routes for mobile app ======== //
router.post("/mob/orders_detail", f11aDash);
router.post("/mob/report_mob", f12aDash);
router.get("/mob/my_iphones", f13aDash);
router.get("/mob/my_iwatches", f14aDash);
router.get("/mob/my_ipods", f15aDash);
router.post("/mob/new_price", f16aDash);
router.post("/mob/new_quantity", f17aDash);
router.post("/mob/monthly_report", f18aDash);
// ========================================== //

// @route to invoices by date page
router.get("/invoices_date", isAdmin, f10aDash);

// @route to print pdf
router.get("/print-pdf/:oid", isAdmin, (req, res) => {
  if (req.params.oid.match(/^[0-9a-fA-F]{24}$/)) {
    Order.findOne({ _id: req.params.oid, isOnline: false })
      .populate("customer")
      .exec((err, order) => {
        if (err) {
          console.log(err);
          req.flash("error", "Database Error");
          res.redirect("back");
        } else {
          if (order) {
            createPDF(order, res, req);
          } else {
            console.log("k");
            req.flash("error", "Invalid order");
            res.redirect("back");
          }
        }
      });
  } else {
    console.log("k");
    req.flash("error", "Invalid URL");
    res.redirect("/");
  }
});

router.get("/download/:date", isAdmin, (req, res) => {
  try{
  console.log(req.params);
  if (req.params.date) {
    var dt = req.params.date;
    dt = dt.split("-").reverse().join("-");
    var ndt = new Date(dt);
    var nextDay = new Date(dt);
    nextDay.setDate(ndt.getDate() + 1);
    function decDate(actDate, numDays) {
      var actDate2 = new Date(actDate);
      actDate2.setDate(actDate.getDate() - numDays);
      function pad(s) {
        return s < 10 ? "0" + s : s;
      }
      var d = new Date(actDate2);
      return [pad(d.getDate()), pad(d.getMonth() + 1), d.getFullYear()].join(
        "-"
      );
    }
    Order.find(
      {
        order_date: { $gte: new Date(dt), $lt: nextDay },
        isPaid: true,
        isOnline: false,
      },
      (err, orders) => {
        if (err) {
          console.log(err);
          req.flash("error", "database error");
          res.redirect("back");
        } else {
          if (orders !== undefined) {
            var pdt_Arr = orders.map((e) => {
              return e.products1;
            });
            var pdts = [];
            pdt_Arr.forEach((e) => {
              e.forEach((p) => {
                pdts.push(p);
              });
            });
            nameCity.findOne((err, nc) => {
              if (err) {
                console.log(err);
                req.flash("error", "database error");
                res.redirect("back");
              } else {
                if (
                  nc !== undefined &&
                  nc.detail !== undefined &&
                  nc.detail.length > 0
                ) {
                  var records = nc.detail;
                  var discounts = [200, 300, 400];
                  var disDates = [25, 26, 27, 28, 29];
                  var n = pdts.length;
                  pdts = pdts.map((e, index) => {
                    return {
                      _id: e._id,
                      product_id: e.product_id,
                      name: records[(index + n) % records.length].name,
                      product: e.product,
                      desc: e.desc,
                      details: e.details,
                      quantity: e.quantity,
                      price: e.price,
                      ctipin: e.ctpin,
                      discount:
                        e.vou != null || e.vou != undefined
                          ? e.vou
                          : discounts[(index + n) % discounts.length],
                      city: records[(index + n) % records.length].city,
                      date: decDate(
                        ndt,
                        disDates[(index + n) % disDates.length]
                      ),
                    };
                  });
                  console.log(pdts);
                  createPDF2(pdts, req.params.date, res, req);
                } else {
                  req.flash("error", "database error");
                  res.redirect("back");
                }
              }
            });
          } else {
            req.flash("error", "orders not found");
            res.redirect("back");
          }
        }
      }
    );
  } else {
    req.flash("error", "invalid url");
    res.redirect("back");
  }
}catch (err) {
  next(err);
}
});

router.get("/invoices_download/:date", isAdmin, (req, res) => {
  try{
  console.log(req.params);
  if (req.params.date) {
    var dt = req.params.date;
    dt = dt.split("-").reverse().join("-");
    var ndt = new Date(dt);
    var nextDay = new Date(dt);
    nextDay.setDate(ndt.getDate() + 1);
    Order.find({
      order_date: { $gte: new Date(dt), $lt: nextDay },
      isPaid: true,
      isOnline: false,
    })
      .populate("customer")
      .exec((err, orders) => {
        if (err) {
          console.log(err);
          req.flash("error", "database error");
          res.redirect("back");
        } else {
          if (orders !== undefined) {
            createPDF3(orders, dt, res, req);
          } else {
            req.flash("error", "orders not found");
            res.redirect("back");
          }
        }
      });
  } else {
    req.flash("error", "invalid url");
    res.redirect("back");
  }
}catch (err) {
  next(err);
}
});

// function to generate pdf
async function createPDF2(products, dt, res, req) {
  var templateEjs = fs.readFileSync(
    path.join(process.env.PWD, "views", "admin", "ctpin.ejs"),
    "utf8"
  );
  var template = ejs.compile(templateEjs);
  var html = template({ products: products });

  var dir = "./bills/";

  if (!fs.existsSync(dir)) {
    shell.mkdir("-p", dir);
  }
  var pdfPath = path.join(process.env.PWD, "bills", dt + ".pdf");

  var options = {
    // width: '1384px',
    // height: '1012px',
    // landscape: true,
    displayHeaderFooter: false,
    format: "A4",
    margin: "none",
    printBackground: true,
    path: pdfPath,
  };

  const browser = await puppeteer.launch({
    args: ["--no-sandbox"],
    headless: true,
  });

  var page = await browser.newPage();
  await page.setContent(html);
  await page.waitFor("*");
  await page.pdf(options);
  await browser.close();
  var readStream = fs.createReadStream(pdfPath);
  readStream.pipe(res);
  // res.redirect("/products")
  // res.render("bill1",{bill:bill})
  // await res.download(pdfPath,customer.cref+'-'+bill.billno+'.pdf');
}

// function to generate pdf
async function createPDF(bill, res, req) {
  var templateEjs = fs.readFileSync(
    path.join(process.env.PWD, "views", "admin", "pdf.ejs"),
    "utf8"
  );
  var template = ejs.compile(templateEjs);
  var html = template({ bill: bill });

  var dir = "./bills/";

  if (!fs.existsSync(dir)) {
    shell.mkdir("-p", dir);
  }
  var pdfPath = path.join(process.env.PWD, "bills", "bill.pdf");

  var options = {
    // width: '1384px',
    // height: '1012px',
    // landscape: true,
    displayHeaderFooter: false,
    format: "A4",
    margin: "none",
    printBackground: true,
    path: pdfPath,
  };

  const browser = await puppeteer.launch({
    args: ["--no-sandbox"],
    headless: true,
  });

  var page = await browser.newPage();
  await page.setContent(html);
  await page.waitFor("*");
  await page.pdf(options);
  await browser.close();
  var readStream = fs.createReadStream(pdfPath);
  readStream.pipe(res);
  // res.redirect("/products")
  // res.render("bill1",{bill:bill})
  // await res.download(pdfPath,customer.cref+'-'+bill.billno+'.pdf');
}

// function to generate pdf
async function createPDF3(bills, dt, res, req) {
  var templateEjs = fs.readFileSync(
    path.join(process.env.PWD, "views", "admin", "bills.ejs"),
    "utf8"
  );
  var template = ejs.compile(templateEjs);
  var html = template({ bills: bills });

  var dir = "./bills/";

  if (!fs.existsSync(dir)) {
    shell.mkdir("-p", dir);
  }
  var pdfPath = path.join(process.env.PWD, "bills", "bills-" + dt + ".pdf");

  var options = {
    // width: '1384px',
    // height: '1012px',
    // landscape: true,
    displayHeaderFooter: false,
    format: "A4",
    margin: "none",
    printBackground: true,
    path: pdfPath,
  };

  const browser = await puppeteer.launch({
    args: ["--no-sandbox"],
    headless: true,
  });

  var page = await browser.newPage();
  await page.setContent(html);
  await page.waitFor("*");
  await page.pdf(options);
  await browser.close();
  var readStream = fs.createReadStream(pdfPath);
  readStream.pipe(res);
  // res.redirect("/products")
  // res.render("bill1",{bill:bill})
  // await res.download(pdfPath,customer.cref+'-'+bill.billno+'.pdf');
}

module.exports = router;
