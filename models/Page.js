import mongoose from 'mongoose';
import slugify from 'slugify';

const pageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required'],
    trim: true
  },
  audioUrl: {
    type: String,
    trim: true
  },
  thumbnailUrl: {
    type: String,
    required: [true, 'Thumbnail URL is required'],
    trim: true
  },
  groups: {
    type: [String],
    default: [],
    validate: {
      validator: function(v) {
        if (v.length > 10) {
          return false; // Maximum 10 groups
        }
        // Validate that all groups are from allowed options
        const allowedGroups = ['blogs', 'cardiology', 'case-studies'];
        return v.every(group => allowedGroups.includes(group));
      },
      message: 'Groups must be from allowed options: blogs, cardiology, case-studies and cannot exceed 10 items'
    }
  },
  // SEO Fields
  metaTitle: {
    type: String,
    trim: true,
    maxlength: [60, 'Meta title cannot be more than 60 characters']
  },
  metaDescription: {
    type: String,
    trim: true,
    maxlength: [160, 'Meta description cannot be more than 160 characters']
  },
  metaKeywords: {
    type: String,
    trim: true,
    maxlength: [255, 'Meta keywords cannot be more than 255 characters']
  },
  slug: {
    type: String,
    required: [true, 'Slug is required'],
    unique: true,
    trim: true,
    lowercase: true,
    maxlength: [100, 'Slug cannot be more than 100 characters']
  },
  content: {
    type: String,
    default: ''
  },
  // Popular posts flag
  popular: {
    type: Boolean,
    default: false
  },
  // Tags for the page
  tags: {
    type: [String],
    default: [],
    validate: {
      validator: function(v) {
        return v.length <= 20; // Maximum 20 tags
      },
      message: 'Cannot have more than 20 tags'
    }
  },
  // Category for the page
  category: {
    type: String,
    trim: true,
    maxlength: [100, 'Category cannot be more than 100 characters']
  },
  // Read time in minutes
  readTime: {
    type: Number,
    min: [1, 'Read time must be at least 1 minute'],
    max: [999, 'Read time cannot exceed 999 minutes']
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Pre-save middleware to generate slug from title if not provided
pageSchema.pre('save', function(next) {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });
  }
  next();
});

// Ensure slug is always lowercase and properly formatted
pageSchema.pre('save', function(next) {
  if (this.slug) {
    this.slug = slugify(this.slug, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });
  }
  next();
});

// Index for better query performance
// Note: slug index is already created by 'unique: true' in schema
pageSchema.index({ groups: 1 });
pageSchema.index({ createdAt: -1 });
pageSchema.index({ metaTitle: 'text', metaDescription: 'text', metaKeywords: 'text' });

const Page = mongoose.model('Page', pageSchema);

export default Page;