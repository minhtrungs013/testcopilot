import { useParams } from 'react-router-dom';

function useTenantSlug() {
  const { slug } = useParams();
  return slug;
}

export default useTenantSlug;
