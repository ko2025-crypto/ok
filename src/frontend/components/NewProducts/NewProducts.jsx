import { useAllProductsContext } from '../../contexts/ProductsContextProvider';
import ProductCard from '../ProductCard/ProductCard';
import Title from '../Title/Title';
import styles from './NewProducts.module.css';

const NewProducts = () => {
  const { products: productsFromContext } = useAllProductsContext();

  const newProductsList = productsFromContext.filter(
    (product) => product?.isNew
  );

  if (newProductsList.length === 0) {
    return null;
  }

  return (
    <section className={`section ${styles.newProductsSection}`}>
      <div className={styles.titleContainer}>
        <Title>
          <span className={styles.newText}>¡Nuevos Productos!</span>
        </Title>
        <p className={styles.subtitle}>
          Descubre las últimas incorporaciones a nuestra tienda
        </p>
      </div>

      <div className={`container ${styles.newProductsCenter}`}>
        {newProductsList.map((singleProduct) => (
          <ProductCard key={singleProduct._id} product={singleProduct} />
        ))}
      </div>
    </section>
  );
};

export default NewProducts;