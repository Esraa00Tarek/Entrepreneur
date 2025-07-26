import mongoose from 'mongoose';
import { Service } from '../models/Service.js'

// Function to create a new service
export const createService = async (req, res) => {
  try {
    // Debug logging
    console.log('Service creation request:', {
      body: req.body,
      imageUrls: req.imageUrls,
      cloudinaryFileUrl: req.cloudinaryFileUrl,
      cloudinaryFileInfo: req.cloudinaryFileInfo
    });

    const { name, category, price, description, status, supplierId } = req.body;

    // Validate required fields
    if (!name || !category || !price || !description) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, category, price, and description are required' 
      });
    }

    // Check if images were uploaded (if available)
    const imageUrls = req.imageUrls || [];  // If images were uploaded, URLs will be stored in req.imageUrls
    const fileUrls = req.cloudinaryFileUrl ? [req.cloudinaryFileUrl] : [];  // If a single file was uploaded, URL will be stored in req.cloudinaryFileUrl

    // لا حاجة لأي فحص مرفقات هنا بعد الآن

    // Create the service
    const newService = new Service({
      name,
      category,
      price,
      description,
      status: status || 'available', // If status is not specified, it will be 'available' by default
      isActive: true,
      supplierId: supplierId || req.user._id, // Use current user ID if not provided
      images: imageUrls,  // Service images
      files: fileUrls,  // Files uploaded with the service
    });

    // Save the service to the database
    await newService.save();

    res.status(201).json({
      message: 'Service created successfully',
      service: newService,
    });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ 
      error: 'An error occurred while creating the service',
      details: error.message 
    });
  }
};

// @desc Update a service
export const updateService = async (req, res) => {
  try {
    const serviceId = req.params.serviceId;
    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return res.status(400).json({ error: 'Invalid service ID format' });
    }
    const { name, category, price, description, isActive, status } = req.body;

    const updateData = {
      name,
      category,
      price,
      description,
      isActive: isActive === 'true',
      status: status || 'available', // If status is not specified, it will be 'available' by default
    };

    // If new images were uploaded
    if (req.imageUrls && req.imageUrls.length > 0) {
      updateData.images = req.imageUrls;
    }

    // If new files were uploaded
    if (req.filesUrls && req.filesUrls.length > 0) {
      updateData.files = req.filesUrls;
    }

    const updatedService = await Service.findByIdAndUpdate(serviceId, updateData, {
      new: true,
      runValidators: true
    });

    if (!updatedService) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.status(200).json(updatedService);
  } catch (err) {
    console.error('Error updating service:', err.message); // Print error message
    console.error('Stack Trace:', err.stack); // Print stack trace
    res.status(400).json({ error: 'Failed to update service', details: err.message });
  }
};

// @desc Delete a service
export const deleteService = async (req, res) => {
  try {
    const serviceId = req.params.serviceId;
    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return res.status(400).json({ error: 'Invalid service ID format' });
    }
    await Service.findByIdAndDelete(serviceId);
    res.status(200).json({ message: 'Service deleted successfully' });
  } catch (err) {
    console.error('Error deleting service:', err.message); // Print error message
    console.error('Stack Trace:', err.stack); // Print stack trace
    res.status(500).json({ error: 'Failed to delete service', details: err.message });
  }
};

// @desc Toggle the active status of a service
export const toggleServiceActiveStatus = async (req, res) => {
  try {
    const serviceId = req.params.serviceId;
    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return res.status(400).json({ error: 'Invalid service ID format' });
    }
    const service = await Service.findById(serviceId);

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    service.isActive = !service.isActive;
    await service.save();

    res.status(200).json({
      message: `Service is now ${service.isActive ? 'active' : 'inactive'}`,
      isActive: service.isActive
    });
  } catch (err) {
    console.error('Error toggling service active status:', err.message); // Print error message
    console.error('Stack Trace:', err.stack); // Print stack trace
    res.status(500).json({ error: 'Failed to change service status', details: err.message });
  }
};

// @desc Get a single service by ID
export const getServiceById = async (req, res) => {
  try {
    const serviceId = req.params.serviceId;
    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return res.status(400).json({ error: 'Invalid service ID format' });
    }
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.status(200).json(service);
  } catch (err) {
    console.error('Error getting service by ID:', err.message); // Print error message
    console.error('Stack Trace:', err.stack); // Print stack trace
    res.status(500).json({ error: 'Failed to get service', details: err.message });
  }
};

// @desc Get all services for a supplier
export const getServicesBySupplier = async (req, res) => {
  try {
    const supplierId = req.params.supplierId;
    if (!mongoose.Types.ObjectId.isValid(supplierId)) {
      return res.status(400).json({ error: 'Invalid supplier ID format' });
    }
    const services = await Service.find({ supplierId });
    res.status(200).json(services);
  } catch (err) {
    console.error('Error getting services by supplier:', err.message); // Print error message
    console.error('Stack Trace:', err.stack); // Print stack trace
    res.status(500).json({ error: 'Failed to get services', details: err.message });
  }
};

// @desc Filter services based on query
export const filterServices = async (req, res) => {
  try {
    const { name, category, isActive, supplierId } = req.query;

    const query = {};

    if (name) {
      query.name = { $regex: name, $options: 'i' }; // Partial search case-insensitive
    }
    if (category) {
      query.category = category;
    }
    if (isActive !== undefined) {
      query.isActive = isActive === 'true'; // Convert to Boolean
    }
    if (supplierId) {
      query.supplierId = supplierId;
    }

    const services = await Service.find(query);
    res.status(200).json(services);
  } catch (err) {
    console.error('Error filtering services:', err.message); // Print error message
    console.error('Stack Trace:', err.stack); // Print stack trace
    res.status(500).json({ error: 'Failed to filter services', details: err.message });
  }
};

// @desc Upload a file and attach it to a service
export const uploadServiceFile = async (req, res) => {
  try {
    const { serviceId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return res.status(400).json({ error: 'Invalid service ID format' });
    }
    // Find the service
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    // Check if user owns this service
    if (!service.supplierId.equals(req.user._id)) {
      return res.status(403).json({ error: 'Not authorized to modify this service' });
    }
    if (req.cloudinaryFileInfo) {
      // Add the file URL to the service
      service.files.push(req.cloudinaryFileUrl);
      await service.save();
      return res.status(200).json({
        message: 'File uploaded and attached to service successfully',
        fileUrl: req.cloudinaryFileUrl,
        service: service
      });
    } else {
      return res.status(400).json({ error: 'No file was uploaded' });
    }
  } catch (error) {
    console.error('Error uploading file to service:', error);
    res.status(500).json({
      error: 'Failed to upload file to service',
      details: error.message
    });
  }
};
