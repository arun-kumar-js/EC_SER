import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase(
  {
    name: 'SpiderEKartDB',
    location: 'default',
  },
  () => {},
  error => {
    console.error('Error opening database:', error);
  }
);

export const initDB = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      console.log('Initializing database and creating tables if not exist.');
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          price REAL NOT NULL,
          description TEXT,
          image TEXT
        );`
      );
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS cart (
          id INTEGER PRIMARY KEY NOT NULL,
          productId INTEGER NOT NULL,
          quantity INTEGER NOT NULL,
          FOREIGN KEY (productId) REFERENCES products(id)
        );`
      );
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS wishlist (
          id INTEGER PRIMARY KEY NOT NULL,
          productId INTEGER NOT NULL,
          addedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (productId) REFERENCES products(id)
        );`
      );
    },
    error => {
      console.error('Error during DB init transaction:', error);
      reject(error);
    },
    () => {
      console.log('Database initialized successfully.');
      resolve();
    });
  });
};

export const insertProduct = (product) => {
  const { id, name, price, description, image } = product;
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      console.log(`Inserting or replacing product: id=${id}, name=${name}, price=${price}`);
      tx.executeSql(
        `INSERT OR REPLACE INTO products (id, name, price, description, image) VALUES (?, ?, ?, ?, ?);`,
        [id, name, price, description, image],
        (_, result) => {
          console.log('Product insert/replace successful:', result);
          resolve(result);
        },
        (_, error) => {
          console.error('Error inserting product:', error);
          reject(error);
        }
      );
    });
  });
};

export const getProducts = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      console.log('Fetching all products.');
      tx.executeSql(
        `SELECT * FROM products;`,
        [],
        (_, result) => {
          let products = [];
          for (let i = 0; i < result.rows.length; i++) {
            products.push(result.rows.item(i));
          }
          console.log('Fetched products:', products);
          resolve(products);
        },
        (_, error) => {
          console.error('Error fetching products:', error);
          reject(error);
        }
      );
    });
  });
};

export const addToCart = (product, quantity) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      if (quantity === 0) {
        console.log(`Deleting product from cart: productId=${product.id}`);
        tx.executeSql(
          `DELETE FROM cart WHERE productId = ?;`,
          [product.id],
          (_, result) => {
            console.log('Deleted product from cart:', result);
            resolve(result);
          },
          (_, error) => {
            console.error('Error deleting product from cart:', error);
            reject(error);
          }
        );
      } else {
        console.log(`Adding or updating cart item: productId=${product.id}, quantity=${quantity}`);
        // Before insert/update, log the product details
        console.log(`Product details - id: ${product.id}, name: ${product.name}, price: ${product.price}, quantity: ${quantity}`);
        tx.executeSql(
          `SELECT quantity FROM cart WHERE productId = ?;`,
          [product.id],
          (_, selectResult) => {
            if (selectResult.rows.length > 0) {
              console.log('Updating existing cart item.');
              tx.executeSql(
                `UPDATE cart SET quantity = ? WHERE productId = ?;`,
                [quantity, product.id],
                (_, updateResult) => {
                  console.log('Cart item updated:', updateResult);
                  resolve(updateResult);
                },
                (_, updateError) => {
                  console.error('Error updating cart item:', updateError);
                  reject(updateError);
                }
              );
            } else {
              console.log('Inserting new cart item.');
              tx.executeSql(
                `INSERT INTO cart (productId, quantity) VALUES (?, ?);`,
                [product.id, quantity],
                (_, insertResult) => {
                  console.log('Cart item inserted:', insertResult);
                  resolve(insertResult);
                },
                (_, insertError) => {
                  console.error('Error inserting cart item:', insertError);
                  reject(insertError);
                }
              );
            }
          },
          (_, selectError) => {
            console.error('Error selecting cart item:', selectError);
            reject(selectError);
          }
        );
      }
    });
  });
};

export const getCartItems = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      console.log('Fetching cart items.');
      tx.executeSql(
        `SELECT cart.productId, cart.quantity, products.name, products.price, products.description, products.image
         FROM cart
         JOIN products ON cart.productId = products.id;`,
        [],
        (_, result) => {
          let items = [];
          for (let i = 0; i < result.rows.length; i++) {
            items.push(result.rows.item(i));
          }
          console.log('Current cart items:', items);
          resolve(items);
        },
        (_, error) => {
          console.error('Error fetching cart items:', error);
          reject(error);
        }
      );
    });
  });
};

// Wishlist functions
export const addToWishlist = (product) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      console.log(`Adding product to wishlist: productId=${product.id}`);
      
      // Extract product data with proper structure handling
      const productId = product.id;
      const productName = product.name || 'Unknown Product';
      const productPrice = product.variants?.[0]?.price || product.price || 0;
      const productDescription = product.description || '';
      const productImage = product.image || '';
      
      console.log('Product data:', { productId, productName, productPrice, productDescription, productImage });
      
      // First, ensure the product exists in the products table
      tx.executeSql(
        `INSERT OR REPLACE INTO products (id, name, price, description, image) VALUES (?, ?, ?, ?, ?);`,
        [productId, productName, productPrice, productDescription, productImage],
        (_, productResult) => {
          console.log('Product ensured in products table:', productResult);
          // Then add to wishlist
          tx.executeSql(
            `INSERT OR IGNORE INTO wishlist (productId) VALUES (?);`,
            [productId],
            (_, wishlistResult) => {
              console.log('Product added to wishlist:', wishlistResult);
              resolve(wishlistResult);
            },
            (_, wishlistError) => {
              console.error('Error adding product to wishlist:', wishlistError);
              reject(wishlistError);
            }
          );
        },
        (_, productError) => {
          console.error('Error ensuring product in products table:', productError);
          reject(productError);
        }
      );
    });
  });
};

export const removeFromWishlist = (productId) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      console.log(`Removing product from wishlist: productId=${productId}`);
      tx.executeSql(
        `DELETE FROM wishlist WHERE productId = ?;`,
        [productId],
        (_, result) => {
          console.log('Product removed from wishlist:', result);
          resolve(result);
        },
        (_, error) => {
          console.error('Error removing product from wishlist:', error);
          reject(error);
        }
      );
    });
  });
};

export const isInWishlist = (productId) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      console.log(`Checking if product is in wishlist: productId=${productId}`);
      tx.executeSql(
        `SELECT COUNT(*) as count FROM wishlist WHERE productId = ?;`,
        [productId],
        (_, result) => {
          const count = result.rows.item(0).count;
          const isInWishlist = count > 0;
          console.log(`Product ${productId} is in wishlist:`, isInWishlist);
          resolve(isInWishlist);
        },
        (_, error) => {
          console.error('Error checking wishlist:', error);
          reject(error);
        }
      );
    });
  });
};

export const getWishlistItems = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      console.log('Fetching wishlist items.');
      tx.executeSql(
        `SELECT wishlist.productId, wishlist.addedAt, products.name, products.price, products.description, products.image
         FROM wishlist
         JOIN products ON wishlist.productId = products.id
         ORDER BY wishlist.addedAt DESC;`,
        [],
        (_, result) => {
          let items = [];
          for (let i = 0; i < result.rows.length; i++) {
            items.push(result.rows.item(i));
          }
          console.log('Current wishlist items:', items);
          resolve(items);
        },
        (_, error) => {
          console.error('Error fetching wishlist items:', error);
          reject(error);
        }
      );
    });
  });
};
