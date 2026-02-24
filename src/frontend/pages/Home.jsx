import { Categories, FeaturedProducts, Hero } from '../components';
import { useAllProductsContext } from '../contexts/ProductsContextProvider';
import NewProducts from '../components/NewProducts/NewProducts';

const Home = () => {
  const { products: productsFromContext } = useAllProductsContext();

  if (productsFromContext.length < 1) {
    return <main className='full-page'></main>;
  }

  return (
    <main>
      <Hero />
      <NewProducts />
      <Categories />
      <FeaturedProducts />
    </main>
  );
};

export default Home;
