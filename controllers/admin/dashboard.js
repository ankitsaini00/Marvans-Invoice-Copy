var Admin = require("../../models/admin"),
  Pincode = require("../../models/pincode"),
  Order = require("../../models/order"),
  Customer = require("../../models/customer"),
  Iphone = require("../../models/iphone"),
  Iwatch = require("../../models/iwatch"),
  Ipod = require("../../models/ipod"),
  multer = require("multer"),
  { cloudinary, cloudinaryUpload } = require("../../cloudinary/cloudinary");
const iphone = require("../../models/iphone");
var ObjectID = require("mongodb").ObjectID;

module.exports = {
  f1aDash(req, res) {
    if (req.params.type == "0") {
      Order.find({ isOnline: false, isPaid: true })
        .populate("customer")
        .sort({ order_date: -1 })
        .limit(100)
        .exec((err, orders) => {
          if (err) {
            console.log(err);
            req.flash("error", "Database Error");
            res.redirect("/");
          } else {
            res.render("admin/allorders", {
              orders: orders,
              type: req.params.type,
            });
          }
        });
    } else if (req.params.type == "1") {
      Order.find({ isOnline: false, isPaid: true })
        .populate("customer")
        .sort({ order_date: -1 })
        .exec((err, orders) => {
          if (err) {
            console.log(err);
            req.flash("error", "Database Error");
            res.redirect("/");
          } else {
            res.render("admin/allorders", {
              orders: orders,
              type: req.params.type,
            });
          }
        });
    } else {
      req.flash("error", "Invalid URL");
      res.redirect("back");
    }
  },

  f2aDash(req, res) {
    Customer.find({})
      .populate("bills")
      .exec((err, customers) => {
        if (err) {
          console.log(err);
          req.flash("error", "Database Error");
          res.redirect("/");
        } else {
          res.render("admin/customerlist", { customers: customers });
        }
      });
  },

  f3aDash(req, res) {
    if (req.body.by == "1") {
      console.log("h");
      Customer.findOne({ mobile: Number(req.body.mobile) })
        .populate("bills")
        .exec((err, cust) => {
          if (err) {
            console.log(err);
            req.flash("error", "Database Error");
            res.redirect("/");
          } else {
            if (cust) {
              console.log("oh");
              // console.log(cust._id)
              res.redirect("/history/" + cust._id);
            } else {
              req.flash("error", "No such customer");
              res.redirect("/");
            }
          }
        });
    } else {
      Customer.findOne({ refno: Number(req.body.mobile) })
        .populate("bills")
        .exec((err, cust) => {
          if (err) {
            console.log(err);
            req.flash("error", "Database Error");
            res.redirect("/");
          } else {
            if (cust) {
              res.redirect("/history/" + cust._id);
            } else {
              req.flash("error", "No such customer");
              res.redirect("/");
            }
          }
        });
    }
  },

  f4aDash(req, res) {
    console.log("helloo");
    if (req.params.cid.match(/^[0-9a-fA-F]{24}$/)) {
      Customer.findOne({ _id: req.params.cid })
        .populate("bills")
        .exec((err, cust) => {
          if (err) {
            console.log(err);
            req.flash("error", "Database Error");
            res.redirect("/");
          } else {
            if (cust) {
              console.log(req.params.cid);
              res.render("admin/history", { cust: cust });
            } else {
              console.log(req.params.cid);
              req.flash("error", "Invalid order");
              res.redirect("/");
            }
          }
        });
    } else {
      req.flash("error", "Invalid URL");
      res.redirect("back");
    }
  },

  f5aDash(req, res) {
    if (req.params.oid.match(/^[0-9a-fA-F]{24}$/)) {
      Order.findOne({ _id: req.params.oid })
        .populate("customer")
        .exec((err, order) => {
          if (err) {
            console.log(err);
            req.flash("error", "Database Error");
            res.redirect("/");
          } else {
            if (order) {
              order.advance = order.total_paid;
              if (!order.customer.paidbills.includes(order._id)) {
                order.customer.paidbills.push(order._id);
              }
              order.customer.save();
              order.save((err) => {
                if (err) {
                  console.log(err);
                  req.flash("error", "Database Error");
                  res.redirect("/");
                } else {
                  res.redirect("back");
                }
              });
            } else {
              // console.log(req.params.cid)
              req.flash("error", "Invalid order");
              res.redirect("/");
            }
          }
        });
    } else {
      req.flash("error", "Invalid URL");
      res.redirect("back");
    }
  },

  f6aDash(req, res) {
    if (req.params.oid.match(/^[0-9a-fA-F]{24}$/)) {
      Order.findOne(
        { isPaid: true, isOnline: false, _id: req.params.oid },
        (err, o) => {
          if (err) {
            console.log(err);
            req.flash("error", "Database Error");
            res.redirect("back");
          } else {
            if (o) {
              var stop = o.products1.length;
              var done = 0;
              if (stop == 0) {
                o.deleteOne((err) => {
                  if (err) {
                    console.log(err);
                    req.flash("error", "Database Error");
                    res.redirect("back");
                  } else {
                    req.flash("success", "Deleted");
                    res.redirect("back");
                  }
                });
              } else {
                o.products1.forEach((p) => {
                  if (p.product == "1") {
                    Iphone.findOne({ pid: p.product_id }, (err, phone) => {
                      if (err) {
                        res.redirect("/");
                      } else {
                        if (phone) {
                          phone.variants.forEach((v) => {
                            if (v.storage == p.desc) {
                              v.quantity += p.quantity;
                            }
                          });
                          phone.save();
                          done += 1;
                          if (done == stop) {
                            o.deleteOne((err) => {
                              if (err) {
                                console.log(err);
                                req.flash("error", "Database Error");
                                res.redirect("back");
                              } else {
                                req.flash("success", "Deleted");
                                res.redirect("back");
                              }
                            });
                          }
                        }
                      }
                    });
                  } else if (p.product == "2") {
                    Iwatch.findOne({ pid: p.product_id }, (err, phone) => {
                      if (err) {
                        res.redirect("/");
                      } else {
                        if (phone) {
                          phone.variants.forEach((v) => {
                            var desc = v.type + "," + v.size;
                            if (desc == p.desc) {
                              v.quantity += p.quantity;
                            }
                          });
                          phone.save();
                          done += 1;
                          if (done == stop) {
                            o.deleteOne((err) => {
                              if (err) {
                                console.log(err);
                                req.flash("error", "Database Error");
                                res.redirect("back");
                              } else {
                                req.flash("success", "Deleted");
                                res.redirect("back");
                              }
                            });
                          }
                        }
                      }
                    });
                  } else {
                    Ipod.findOne({ pid: p.product_id }, (err, phone) => {
                      if (err) {
                        res.redirect("/");
                      } else {
                        if (phone) {
                          phone.quantity += p.quantity;
                          phone.save();
                          done += 1;
                          if (done == stop) {
                            o.deleteOne((err) => {
                              if (err) {
                                console.log(err);
                                req.flash("error", "Database Error");
                                res.redirect("back");
                              } else {
                                req.flash("success", "Deleted");
                                res.redirect("back");
                              }
                            });
                          }
                        }
                      }
                    });
                  }
                });
              }
            } else {
              req.flash("error", "Invalid order");
              res.redirect("back");
            }
          }
        }
      );
    } else {
      req.flash("error", "Invalid URL");
      res.redirect("back");
    }
  },
  f7aDash(req, res) {
    console.log("hello new");
    Order.find(
      {
        order_date: { $gte: new Date("2021-07-31") },
        isPaid: true,
        isOnline: false,
      },
      (err, orders) => {
        if (err) {
          console.log(err);
          req.flash("error", "database error");
          res.redirect("back");
        } else {
          // console.log(orders);
          if (orders) {
            function convertDate(inputFormat) {
              function pad(s) {
                return s < 10 ? "0" + s : s;
              }
              var d = new Date(inputFormat);
              return [
                pad(d.getDate()),
                pad(d.getMonth() + 1),
                d.getFullYear(),
              ].join("-");
            }
            var dates_arr = orders.map((e) => {
              return convertDate(e.order_date);
            });
            // console.log(dates_arr);
            var dates_arr = dates_arr.filter((e, index) => {
              return dates_arr.indexOf(e) === index;
            });
            // console.log(dates_arr);
            res.render("admin/vouchers", { dates: dates_arr });
          } else {
            req.flash("error", "database error");
            res.redirect("back");
          }
        }
      }
    );
  },
  f8aDash(req, res) {
    Order.find({ isPaid: true, isOnline: false })
      .sort({ order_date: 1 })
      .select("order_date")
      .exec((err, orders) => {
        if (err) {
          console.log(err);
          req.flash("error", "database error");
          res.redirect("back");
        } else {
          // console.log(orders);
          if (orders) {
            function convertDate(inputFormat) {
              function pad(s) {
                return s < 10 ? "0" + s : s;
              }
              var d = new Date(inputFormat);
              return [
                pad(d.getDate()),
                pad(d.getMonth() + 1),
                d.getFullYear(),
              ].join("-");
            }
            var dates_arr = orders.map((e) => {
              return convertDate(e.order_date);
            });
            //    console.log(dates_arr);
            var dates_arr = dates_arr.filter((e, index) => {
              return dates_arr.indexOf(e) === index;
            });
            //    console.log(dates_arr);
            res.render("admin/report", { dates: dates_arr });
          } else {
            req.flash("error", "database error");
            res.redirect("back");
          }
        }
      });
  },
  f9aDash(req, res) {
    if (req.params.date) {
      var dt = req.params.date;
      dt = dt.split("-").reverse().join("-");
      var ndt = new Date(dt);
      var nextDay = new Date(dt);
      nextDay.setDate(ndt.getDate() + 1);
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
              orders = orders.reverse();
              var pdts = [];
              var cash = 0;
              var card = 0;
              var online = 0;
              orders.forEach((e) => {
                if (e.payment_type == "Cash") {
                  cash += e.total_paid;
                } else if (e.payment_type == "Card") {
                  card += e.total_paid;
                } else {
                  online += e.total_paid;
                }
                e.products1.forEach((p) => {
                  // ptype => payment type
                  pdts.push({
                    name: p.name,
                    qty: p.quantity,
                    price: p.price,
                    desc: p.desc,
                    ptype: e.payment_type,
                  });
                });
              });
              res.render("admin/invoices", {
                products: pdts,
                dt: req.params.date,
                card,
                cash,
                online,
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
  },
  f10aDash(req, res) {
    Order.find({
      order_date: { $gte: new Date("2021-07-1"), $lte: new Date("2021-07-31") },
      isPaid: true,
      isOnline: false,
    })
      .select("order_date")
      .exec((err, orders) => {
        if (err) {
          console.log(err);
          req.flash("error", "database error");
          res.redirect("back");
        } else {
          // console.log(orders);
          if (orders) {
            function convertDate(inputFormat) {
              function pad(s) {
                return s < 10 ? "0" + s : s;
              }
              var d = new Date(inputFormat);
              return [
                pad(d.getDate()),
                pad(d.getMonth() + 1),
                d.getFullYear(),
              ].join("-");
            }
            var dates_arr = orders.map((e) => {
              return convertDate(e.order_date);
            });
            //    console.log(dates_arr);
            var dates_arr = dates_arr.filter((e, index) => {
              return dates_arr.indexOf(e) === index;
            });
            //    console.log(dates_arr);
            res.render("admin/invs", { dates: dates_arr });
          } else {
            req.flash("error", "database error");
            res.redirect("back");
          }
        }
      });
  },
  f11aDash(req, res) {
    let { date } = req.body;
    let startDate = new Date(String(date).concat("T00:00:00Z"));
    let endDate = new Date(String(date).concat("T00:00:00Z"));
    endDate.setDate(startDate.getDate() + 1);
    Order.find(
      {
        order_date: { $gte: startDate, $lt: endDate },
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
            orders = orders.reverse();
            var pdts = [];
            orders.forEach((e) => {
              e.products1.forEach((p) => {
                // ptype => payment type
                pdts.push({
                  name: p.name,
                  qty: p.quantity,
                  price: p.price,
                  my_price: p.my_price != null ? p.my_price : 0,
                  desc: p.desc,
                  ptype: e.payment_type,
                  ctpin: p.ctpin,
                });
              });
            });
            res.send({ pdts });
          } else {
            req.flash("error", "orders not found");
            res.redirect("back");
          }
        }
      }
    );
  },
  f12aDash(req, res) {
    let { stD, edD } = req.body;
    let endDate = new Date(String(edD).concat("T00:00:00Z"));
    endDate.setDate(endDate.getDate() + 1);
    Order.find({
      order_date: { $gte: String(stD).concat("T00:00:00Z"), $lt: endDate },
      isPaid: true,
      isOnline: false,
    })
      .sort({ order_date: 1 })
      .exec(async (err, orders) => {
        if (err) {
          console.log(err);
          req.flash("error", "database error");
          res.redirect("back");
        } else {
          if (orders) {
            var newData = {};
            function convertDate(inputFormat) {
              function pad(s) {
                return s < 10 ? "0" + s : s;
              }
              var d = new Date(inputFormat);
              return [
                pad(d.getDate()),
                pad(d.getMonth() + 1),
                d.getFullYear(),
              ].join("-");
            }
            var dates_arr = orders.map((e) => {
              return {
                date: convertDate(e.order_date),
                type: e.payment_type,
                total: e.total_paid,
                myPrices: e.products1.map((e) => e.my_price ?? 0),
                vou: e.products1.map((e) => e.vou ?? 0),
              };
            });
            dates_arr.forEach((e, index) => {
              if (dates_arr.indexOf(e) === index) {
                newData[e.date] = {
                  cash: 0,
                  online: 0,
                  other: 0,
                  my_price: 0,
                  vou: 0,
                };
              }
            });
            dates_arr.forEach((e, index) => {
              if (newData[e.date] != null) {
                if (e.type == "Cash") {
                  newData[e.date].cash += e.total;
                } else if (e.type == "Card") {
                  newData[e.date].other += e.total;
                } else {
                  newData[e.date].online += e.total;
                }
              }
              e.myPrices.forEach((v) => {
                newData[e.date].my_price += v;
              });
              e.vou.forEach((v) => {
                newData[e.date].vou += v;
              });
            });
            res.send(newData);
          } else {
            req.flash("error", "database error");
            res.redirect("back");
          }
        }
      });
  },
  f13aDash(req, res) {
    let iphoneList = [];
    Iphone.find().exec(async (err, ips) => {
      if (err) {
        console.log(err);
        res.send({ error: err });
      } else {
        ips.forEach((e) => {
          let tmp = {};
          tmp.name = e.name;
          tmp.oid = e._id;
          tmp.variants = [];
          for (let i = 0; i < e.variants.length; i++) {
            let model = e.variants[i];
            tmp.variants[i] = {
              vid: model._id,
              storage: model.storage,
              quantity: model.quantity,
              price: model.price,
              isInStock: model.isInStock,
              myPrice: model.my_price != null ? model.my_price : 0,
            };
          }
          iphoneList.push(tmp);
        });
      }
      res.end(JSON.stringify(iphoneList));
    });
  },
  f14aDash(req, res) {
    let iwatchList = [];
    Iwatch.find().exec(async (err, iws) => {
      if (err) {
        console.log(err);
        res.send({ error: err });
      } else {
        iws.forEach((e) => {
          let tmp = {};
          tmp.name = e.name;
          tmp.oid = e._id;
          tmp.variants = [];
          for (let i = 0; i < e.variants.length; i++) {
            let model = e.variants[i];
            tmp.variants[i] = {
              vid: model._id,
              size: model.size,
              type: model.type,
              quantity: model.quantity,
              price: model.price,
              isInStock: model.isInStock,
              myPrice: model.my_price != null ? model.my_price : 0,
            };
          }
          iwatchList.push(tmp);
        });
      }
      res.end(JSON.stringify(iwatchList));
    });
  },
  f15aDash(req, res) {
    let ipodList = [];
    Ipod.find().exec(async (err, iws) => {
      if (err) {
        console.log(err);
        res.send({ error: err });
      } else {
        iws.forEach((e) => {
          let tmp = {};
          tmp.name = e.name;
          tmp.oid = e._id;
          tmp.quantity = e.quantity;
          tmp.price = e.price;
          tmp.isInStock = e.isInStock;
          tmp.myPrice = e.my_price != null ? e.my_price : 0;
          ipodList.push(tmp);
        });
      }
      res.end(JSON.stringify(ipodList));
    });
  },
  f16aDash(req, res) {
    var o_id = new ObjectID(req.body.oid);
    if (req.body.product_code == 1) {
      Iphone.updateOne(
        { _id: o_id, "variants._id": ObjectID(req.body.vid) },
        { $set: { "variants.$.my_price": Number(req.body.price) } },
        (err, value) => {
          if (err) {
            res.send({ status: false });
          } else {
            res.send({ status: true });
          }
        }
      );
    } else if (req.body.product_code == 2) {
      Iwatch.updateOne(
        { _id: o_id, "variants._id": ObjectID(req.body.vid) },
        { $set: { "variants.$.my_price": Number(req.body.price) } },
        (err, value) => {
          if (err) {
            res.send({ status: false });
          } else {
            res.send({ status: true });
          }
        }
      );
    } else if (req.body.product_code == 3) {
      Ipod.updateOne(
        { _id: o_id },
        { $set: { my_price: Number(req.body.price) } },
        (err, value) => {
          if (err) {
            res.send({ status: false });
          } else {
            res.send({ status: true });
          }
        }
      );
    }
  },
  f17aDash(req, res) {
    var o_id = new ObjectID(req.body.oid);
    if (req.body.product_code == 1) {
      Iphone.updateOne(
        { _id: o_id, "variants._id": ObjectID(req.body.vid) },
        { $inc: { "variants.$.quantity": Number(req.body.quantity) } },
        (err, value) => {
          if (err) {
            res.send({ status: false });
          } else {
            res.send({ status: true });
          }
        }
      );
    } else if (req.body.product_code == 2) {
      Iwatch.updateOne(
        { _id: o_id, "variants._id": ObjectID(req.body.vid) },
        { $inc: { "variants.$.quantity": Number(req.body.quantity) } },
        (err, value) => {
          if (err) {
            res.send({ status: false });
          } else {
            res.send({ status: true });
          }
        }
      );
    } else if (req.body.product_code == 3) {
      Ipod.updateOne(
        { _id: o_id },
        { $inc: { quantity: Number(req.body.quantity) } },
        (err, value) => {
          if (err) {
            res.send({ status: false });
          } else {
            res.send({ status: true });
          }
        }
      );
    }
  },

  f18aDash(req, res) {
    let { stD, edD } = req.body;
    let endDate = new Date(String(edD).concat("T00:00:00Z"));
    endDate.setDate(endDate.getDate() + 1);
    Order.find({
      order_date: { $gte: String(stD).concat("T00:00:00Z"), $lt: endDate },
      isPaid: true,
      isOnline: false,
    })
      .sort({ order_date: 1 })
      .exec(async (err, orders) => {
        if (err) {
          console.log(err);
          req.flash("error", "database error");
          res.redirect("back");
        } else {
          if (orders) {
            var newData = {};
            function convertDate(inputFormat) {
              function pad(s) {
                return s < 10 ? "0" + s : s;
              }
              var d = new Date(inputFormat);
              return [
                pad(d.getDate()),
                pad(d.getMonth() + 1),
                d.getFullYear(),
              ].join("-");
            }
            var dates_arr = orders.map((e) => {
              return {
                date: convertDate(e.order_date),
                type: e.payment_type,
                total: e.total_paid,
                products: e.products1.map((e) => {
                  return {
                    name: e.name,
                    qty: e.quantity,
                    price: e.price,
                    my_price: e.my_price,
                    ctpin: e.ctpin,
                  };
                }),
              };
            });
            res.send({ data: dates_arr });
          } else {
            req.flash("error", "database error");
            res.redirect("back");
          }
        }
      });
  },
};

// products: e.products1.map((e) => {
//     return {
//       name: e.name,
//       qty: e.quantity,
//       price: e.price,
//       my_price: e.my_price,
//       ctpin: e.ctpin,
//     };
//   }),
