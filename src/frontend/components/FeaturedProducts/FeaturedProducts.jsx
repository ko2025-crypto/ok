import { useAllProductsContext } from '../../contexts/ProductsContextProvider';
import ProductCard from '../ProductCard/ProductCard';
import Title from '../Title/Title';
import styles from './FeaturedProducts.module.css';

const FeaturedProducts = () => {
  const { products: productsFromContext } = useAllProductsContext();

  // Primero obtener productos nuevos, luego los destacados
  const newProductsList = productsFromContext.filter(
    (product) => product?.isNew
  );
  
  const featuredProductsList = productsFromContext.filter(
    (product) => product?.featured && !product?.isNew
  );
  
  // Combinar productos nuevos al inicio, luego los destacados
  const displayProducts = [...newProductsList, ...featuredProductsList];

  return (
    <section className='section'>
      <Title>Featured Products</Title>

      <div className={`container ${styles.featuredCenter}`}>
        {displayProducts.map((singleProduct) => (
          <ProductCard key={singleProduct._id} product={singleProduct} />
        ))}
      </div>
    </section>
  );
};

export default FeaturedProducts;
