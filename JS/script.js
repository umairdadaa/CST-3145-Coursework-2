// const { type } = require("os");

const app = new Vue({
  el: "#app",
  data: () => {
    return {
      page: "home",
      cart: [],
      search: "",
      sortBy: "subject",
      sortDirection: "asc",
      products: [],
      checkout: [],
      order: {
        name: "",
        email: "",
        address: "",
        city: "",
        zip: "",
        state: "",
        method: "Home",
        gift: false,
      },
      states: {
        AUH: "Abu Dhabi",
        AJM: "Ajman",
        DXB: "Dubai",
        FUJ: "Fujairah",
        RAK: "Ras Al Khaimah",
        SHJ: "Sharjah",
        UMM: "Umm Al Quwain",
      },
      sortByOptions: {
        direction: "desc",
        type : "space",
      },


    };
  },

  // fetch products from the http://localhost:3000/collection/products

  created() {
    fetch("http://localhost:3000/collection/products")
      .then((response) => response.json())
      .then((data) => {
        this.products = data;
      });


  },

  watch: {
    search: function (val) {
      fetch("http://localhost:3000/collection/products/" + this.search)
        .then(
          function (response){
            response.json()
            console.log(response)
            this.products = response
          }
        )
    },
        
  },

  methods: {
    addToCart(product) {
      // this.$emit("addItemToCart", product);
      if (!this.cart.includes(product)) {
        this.cart.push(product);
      } else console.log("Product exists in cart");
      product.cartquantity++;

      Swal.fire(
        "Added to Cart!",
        product.subject + " has been added to your cart!",
        "success"
      );
      console.log("Added product  " + product._id);
      this.products.forEach((item) => {
        if (item.id === product.id) {
          item.space -= 1;
        }
      });
    },

    removeFromCart(product) {
      console.log("Removed product  " + product.id);
      if (product.cartquantity === 1) {
        this.cart.splice(product, 1);
        product.cartquantity = 0;
      } else {
        product.cartquantity--;
        console.log("cartquantity: " + product.cartquantity);
      }
      Swal.fire(
        "Removed from Cart!",
        product.subject + " has been removed from your cart!",
        "warning"
      );
      this.products.forEach((item) => {
        if (item.id === product.id) {
          item.space += 1;
        }
      });
    },

    navigateTo(page) {
      this.page = page;
      console.log(this.page);
    },

    spaceCount(product) {
      if (product.space > 0) {
        return true;
      } else {
        return false;
      }
    },

    onSubmitCheckout: function () {
      if (
        this.order.name &&
        this.order.email &&
        this.order.address &&
        this.order.zip &&
        this.order.state
      ) {
        this.checkout.push(this.order);
        this.order = {
          name: "",
          email: "",
          address: "",
          zip: "",
          state: "",
          method: "Home",
          gift: false,
        };
        this.finalorder = {
          name: this.checkout[0].name,
          email: this.checkout[0].email,
          address: this.checkout[0].address,
          zip: this.checkout[0].zip,
          state: this.checkout[0].state,
          method: this.checkout[0].method,
          gift: this.checkout[0].gift,
          products: this.cart,
          total: this.cart.reduce((acc, item) => acc + item.price, 0) + " AED",
        };
        console.log(this.finalorder);
        Swal.fire(
          "Order Submitted!",
          "Your order has been submitted!",
          "success"
        );
        // push finalorder to http://localhost:3000/collection/orders
        fetch("http://localhost:3000/collection/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(this.finalorder),
        })
          .then((response) => {
            console.log(response);
            return response.text();
          })
          .then((data) => {
            // resolve(data ? JSON.parse(data) : {})
            console.log("Success:", data);
            console.log(this.finalorder);
          })
          .catch((error) => {
            console.error("Error:", error);
          })
          
          const tempObj = {space: this.cart[0].space}
          fetch("http://localhost:3000/collection/products/" + this.cart[0]._id, {	
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(tempObj),
          })
            .then((response) => {
              console.log(response);
              return response.text();
            })
            .then((data) => {
              console.log("Success:", data);
              console.log(this.finalorder);
            })

        this.cart = [];
        this.navigateTo("products");
      } else {
        Swal.fire(
          "Missing Fields?",
          "Please Make Sure all fields are filled out",
          "error"
        );
        this.page = "checkout";
      }
    },

    checkoutCart() {
      if (this.cart.length > 0) {
        this.page = "checkout";
      } else {
        Swal.fire(
          "Empty Cart?",
          "Add something from the store first!",
          "question"
        );
      }
    },

    sortProducts() {
      let url = '';
      if (this.sortByOptions.type == "price") {
        if (this.sortByOptions.direction == "asc") {
          url = "http://localhost:3000/collection/products/price/1";
        } else if (this.sortByOptions.direction == "desc") {
          url = "http://localhost:3000/collection/products/price/-1";
        }
      } else if (this.sortByOptions.type == "subject") {
        if (this.sortByOptions.direction == "asc") {
          url = "http://localhost:3000/collection/products/subject/1";
        } else if (this.sortByOptions.direction == "desc") {
          url = "http://localhost:3000/collection/products/subject/-1";
        }
      } else if (this.sortByOptions.type == "location") {
        if (this.sortByOptions.direction == "asc") {
          url = "http://localhost:3000/collection/products/location/1";
        } else if (this.sortByOptions.direction == "desc") {
          url = "http://localhost:3000/collection/products/location/-1";
        }
      } else if (this.sortByOptions.type == "space") {
        if (this.sortByOptions.direction == "asc") {
          url = "http://localhost:3000/collection/products/space/1";
        } else if (this.sortByOptions.direction == "desc") {
          url = "http://localhost:3000/collection/products/space/-1";
        }
      }

      fetch(url)
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          this.products = data;
        });
      
    },

    searchProducts() {
      if (this.search.length > 0) {
        fetch(`http://localhost:3000/collection/products/search/"${val}`)

        .then(res => {
            return res.json()
        })
        .then(data => {
            this.products = data
        })
        .catch(err => {
            this.products = []
            console.log(`unable to get lessons: ${err}`)
        })
            }
        },
  },
  computed: {
    filteredProducts() {
      if (this.search) {
        let search = this.search.toLowerCase();
        return this.products.filter((product) => {
        return product.subject.toLowerCase().match(search) || product.location.toLowerCase().match(search);
        });
      }
    
      else {
        return this.products;
      }
      },

    cartTotal() {
      let total = 0;
      this.cart.forEach((item) => {
        total += item.price * item.cartquantity;
      });
      console.log(total);
      return total;
    },

    cartCount() {
      let count = 0;
      this.cart.forEach((item) => {
        count += item.cartquantity;
      });
      console.log(count);
      return count;
    },
  },
});
