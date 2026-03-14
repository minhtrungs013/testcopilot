import Tenant from '../models/tenant.model.js';

async function tenantMiddleware(req, res, next) {
  try {
    const slug = req.params.slug;

    if (!slug) {
      return res.status(404).json({
        message: 'Tenant slug is required.',
      });
    }

    const tenant = await Tenant.findOne({ slug: String(slug).toLowerCase() }).select('_id slug name status');

    if (!tenant) {
      return res.status(404).json({
        message: 'Tenant not found.',
      });
    }

    if (tenant.status !== 'active') {
      return res.status(403).json({
        message: 'Tenant is suspended.',
      });
    }

    req.tenant = {
      tenant_id: tenant._id,
      slug: tenant.slug,
      name: tenant.name,
    };

    return next();
  } catch (error) {
    return next(error);
  }
}

export default tenantMiddleware;
