import React from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Grid,
  Box,
  Avatar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Rating,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, ChevronLeft, ChevronRight, FormatQuote } from '@mui/icons-material';
import { Link } from 'react-router-dom';


// Reusable animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3, // Stagger the animation of child elements
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 50, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};
const colors = { 
  primary: '#345B63', 
  secondary: '#D4ECDD', 
  accent: '#152D35', 
  background: '#ECECEC', 
  textPrimary: '#FFFFFF', 
  textSecondary: '#4D4D4D', 
  buttonHover: '#2A4B52', 
  testimonialCardBg: 'rgba(255, 255, 255, 0.95)', 
  quoteIcon: '#F7B32D', 
  ratingStar: '#F7B32D', 
  footerBg: '#152D35', 
};

const AnimatedSection = ({ children, title, description }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true, // Only trigger once
    threshold: 0.1 // Percentage of element in view
  });

  React.useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={containerVariants}
    >
      <Typography 
        variant="h3" 
        align="center" 
        fontWeight="bold" 
        gutterBottom 
        component={motion.h3}
        variants={itemVariants}
        color={colors.textPrimary}
        sx={{ fontSize: { xs: '2rem', md: '3rem' } }}
      >
        {title}
      </Typography>
      <Typography 
        variant="h6" 
        align="center" 
        color={colors.textPrimary}
        sx={{ mb: 6, opacity: 0.9, fontSize: { xs: '1rem', md: '1.25rem' } }}
        component={motion.h6}
        variants={itemVariants}
      >
        {description}
      </Typography>
      {children}
    </motion.div>
  );
};

const testimonials = [
  {
    name: 'Jane Muthoni',
    role: 'School Administrator, Nairobi',
    text: 'OneClickSMIS has reduced our workload by 70%, allowing us to focus on students.',
    initials: 'JM',
    rating: 5,
    yearOfUse: '2 years'
  },
  {
    name: 'Peter Ochieng',
    role: 'Teacher, Mombasa',
    text: 'The AI lesson plans revolutionized my teaching, saving hours every week.',
    initials: 'PO',
    rating: 5,
    yearOfUse: '1.5 years'
  },
  {
    name: 'Sarah Wanjiru',
    role: 'Accountant, Kisumu',
    text: 'Fee collection has never been easier. Mpesa integration is a game-changer!',
    initials: 'SW',
    rating: 4,
    yearOfUse: '1 year'
  },
  {
    name: 'David Kimani',
    role: 'Principal, Nakuru',
    text: 'The analytics dashboard gives me real-time insights into school performance. Decision-making has never been more data-driven.',
    initials: 'DK',
    rating: 5,
    yearOfUse: '2 years'
  },
  {
    name: 'Grace Akinyi',
    role: 'Department Head, Eldoret',
    text: 'Coordinating with teachers and tracking curriculum coverage is seamless now. The progress reports are particularly impressive.',
    initials: 'GA',
    rating: 5,
    yearOfUse: '6 months'
  },
  {
    name: 'Mohammed Hassan',
    role: 'IT Administrator, Malindi',
    text: 'The system is incredibly user-friendly. Training new staff takes minutes, not days like our old system.',
    initials: 'MH',
    rating: 4,
    yearOfUse: '1 year'
  }
];
const TestimonialsCarousel = () => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const itemsPerPage = isMobile ? 1 : 3;
  
  const totalPages = Math.ceil(testimonials.length / itemsPerPage);
  const paginatedTestimonials = testimonials.slice(
    currentIndex,
    currentIndex + itemsPerPage
  );

  const handleNext = () => {
    setCurrentIndex((prev) => 
      prev + itemsPerPage >= testimonials.length ? 0 : prev + itemsPerPage
    );
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => 
      prev - itemsPerPage < 0 ? 
        testimonials.length - itemsPerPage : 
        prev - itemsPerPage
    );
  };
  return (
    <motion.div variants={itemVariants}>
      <Box sx={{ position: 'relative' }}>
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentIndex}
            style={{
              display: 'flex',
              gap: '2rem',
              justifyContent: 'center',
              padding: '1rem',
              flexDirection: { xs: 'column', md: 'row' }
            }}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
          >
            {paginatedTestimonials.map((testimonial, index) => (
              <motion.div
                key={`${testimonial.name}-${index}`}
                whileHover={{ 
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                style={{ flex: 1 }}
              >
                <Box
                  sx={{
                    backgroundColor: colors.testimonialCardBg,
                    borderRadius: '20px',
                    p: 4,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <Box sx={{ position: 'absolute', top: 20, right: 20 }}>
                    <FormatQuote sx={{ fontSize: 40, color: colors.quoteIcon, opacity: 0.3 }} />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar
                      sx={{
                        width: 60,
                        height: 60,
                        bgcolor: colors.accent,
                        color: colors.textPrimary,
                        fontWeight: 'bold',
                      }}
                    >
                      {testimonial.initials}
                    </Avatar>
                    <Box sx={{ ml: 2 }}>
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        color={colors.accent}
                        sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}
                      >
                        {testimonial.name}
                      </Typography>
                      <Typography
                        variant="subtitle2"
                        color={colors.textSecondary}
                        sx={{ fontSize: { xs: '0.75rem', md: '1rem' } }}
                      >
                        {testimonial.role}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography
                    variant="body1"
                    sx={{
                      fontStyle: 'italic',
                      mb: 3,
                      color: colors.accent,
                      flex: 1,
                      fontSize: { xs: '0.875rem', md: '1rem' }
                    }}
                  >
                    "{testimonial.text}"
                  </Typography>

                  <Box sx={{ mt: 'auto' }}>
                    <Rating 
                      value={testimonial.rating} 
                      readOnly 
                      sx={{ color: colors.ratingStar }}
                    />
                    <Typography variant="caption" color={colors.textSecondary} display="block">
                      User for {testimonial.yearOfUse}
                    </Typography>
                  </Box>
                </Box>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        <IconButton
          onClick={handlePrev}
          sx={{
            position: 'absolute',
            left: -20,
            top: '50%',
            transform: 'translateY(-50%)',
            bgcolor: colors.testimonialCardBg,
            '&:hover': { bgcolor: colors.textPrimary },
          }}
        >
          <ChevronLeft />
        </IconButton>
        <IconButton
          onClick={handleNext}
          sx={{
            position: 'absolute',
            right: -20,
            top: '50%',
            transform: 'translateY(-50%)',
            bgcolor: colors.testimonialCardBg,
            '&:hover': { bgcolor: colors.textPrimary },
          }}
        >
          <ChevronRight />
        </IconButton>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mt: 4,
            gap: 1
          }}
        >
          {[...Array(totalPages)].map((_, i) => (
            <Box
              key={i}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: currentIndex / itemsPerPage === i ? colors.accent : `${colors.textPrimary}50`,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onClick={() => setCurrentIndex(i * itemsPerPage)}
            />
          ))}
        </Box>
      </Box>
    </motion.div>
  );
};

const CTAForm = () => {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    schoolName: '',
    phoneNumber: ''
  });
  const [loading, setLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    const response = await fetch('http://localhost:3000/api/leads/capture', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });

    const data = await response.json();
    
    if (data.success) {
      setSubmitted(true);
    } else {
      setError(data.message || 'Failed to submit form. Please try again later.');
    }
  } catch (err) {
    setError('Failed to submit form. Please try again later.');
    console.error('Submission Error:', err);
  } finally {
    setLoading(false);
  }
};

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <motion.div variants={itemVariants}>
      {!submitted ? (
        <motion.form 
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Grid container spacing={2} maxWidth="sm" sx={{ mx: 'auto', mb: 4 }}>
            <Grid item xs={12} md={6}>
              <motion.div whileHover={{ scale: 1.02 }}>
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: colors.textPrimary,
                    fontSize: '1rem',
                  }}
                />
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div whileHover={{ scale: 1.02 }}>
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: colors.textPrimary,
                    fontSize: '1rem',
                  }}
                />
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div whileHover={{ scale: 1.02 }}>
                <input
                  type="text"
                  name="schoolName"
                  placeholder="School Name"
                  required
                  value={formData.schoolName}
                  onChange={handleChange}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: colors.textPrimary,
                    fontSize: '1rem',
                  }}
                />
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div whileHover={{ scale: 1.02 }}>
                <input
                  type="tel"
                  name="phoneNumber"
                  placeholder="Phone Number"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: colors.textPrimary,
                    fontSize: '1rem',
                  }}
                />
              </motion.div>
            </Grid>
          </Grid>

          {error && (
            <Typography 
              color="error" 
              align="center" 
              sx={{ mb: 2 }}
            >
              {error}
            </Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            sx={{
              px: 5,
              py: 1.5,
              backgroundColor: colors.accent,
              color: colors.textPrimary,
              '&:hover': { 
                backgroundColor: colors.buttonHover,
                transform: 'scale(1.05)',
                transition: 'all 0.3s ease'
              },
              transition: 'all 0.3s ease'
            }}
            component={motion.button}
            whileHover={{ 
              scale: 1.05,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.95 }}
          >
            {loading ? 'Submitting...' : 'Request Demo'}
          </Button>
        </motion.form>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography 
            variant="h6" 
            align="center" 
            sx={{ 
              color: colors.textPrimary,
              mb: 2,
              p: 3,
              borderRadius: 2,
              background: 'rgba(255, 255, 255, 0.1)'
            }}
          >
            Thank you for your interest! Our team will contact you shortly.
          </Typography>
        </motion.div>
      )}
    </motion.div>
  );
};

const LandingPage = () => {
  return (
    <>
      {/* Previous AppBar and Hero Section remain the same */}
       <AppBar position="sticky" sx={{ backgroundColor: colors.primary }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', letterSpacing: '0.1em' }}>
            OneClickSMIS
          </Typography>
          <Box>
            <Button color="inherit" component={Link} to="/blog">
              Blog
            </Button>
            <Button color="inherit" href="#benefits">
              Benefits
            </Button>
            <Button color="inherit" href="#testimonials">
              Testimonials
            </Button>
            <Button color="inherit" href="#faq">
              FAQ
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              component={Link}
              to="/login"
              sx={{
                ml: 2,
                borderColor: colors.textPrimary,
                borderWidth: '2px',
                color: colors.textPrimary
              }}
            >
              Login
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(to bottom, ${colors.secondary}, ${colors.primary})`,
          color: colors.textPrimary,
          py: 10,
          textAlign: 'center',
          overflow: 'hidden', // Ensures animations don't create scrollbars
        }}
      >
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.8,
              ease: "easeOut"
            }}
          >
            <Typography 
              variant="h2" 
              fontWeight="bold" 
              gutterBottom
              component={motion.h2}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              sx={{ fontSize: { xs: '2rem', md: '3rem' } }}
            >
              Revolutionize School Administration
            </Typography>
            
            <Typography 
              variant="h5" 
              color="rgba(255, 255, 255, 0.9)" 
              gutterBottom
              component={motion.h5}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              sx={{ fontSize: { xs: '1rem', md: '1.5rem' } }}
            >
              Simplify operations, track payments, and support teachers with AI-driven tools for Kenyan schools.
            </Typography>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <Button
                variant="contained"
                size="large"
                sx={{
                  mt: 4,
                  px: 5,
                  py: 1.5,
                  fontWeight: 'bold',
                  backgroundColor: colors.accent,
                  color: colors.textPrimary,
                  '&:hover': { 
                    backgroundColor: colors.buttonHover,
                    transform: 'scale(1.05)',
                    transition: 'all 0.3s ease'
                  },
                  transition: 'all 0.3s ease'
                }}
                component={motion.button}
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.95 }}
                to="/signup"
              >
                Get Started Free
              </Button>
            </motion.div>

            {/* Optional: Add floating elements for visual interest */}
            <motion.div
              style={{
                position: 'absolute',
                left: '5%',
                top: '20%',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
              }}
              animate={{
                y: [0, -20, 0],
                x: [0, 10, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              style={{
                position: 'absolute',
                right: '10%',
                bottom: '30%',
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
              }}
              animate={{
                y: [0, 20, 0],
                x: [0, -15, 0],
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        </Container>
      </Box>
      
      {/* Benefits Section with Scroll Animations */}
      <Box
        sx={{
          background: colors.background,
          py: 10,
        }}
      >
        <Container maxWidth="lg" id="benefits">
          <AnimatedSection 
            title="Why Choose OneClickSMIS?"
            description="Empowering schools with tools to succeed in a modern world."
          >
            <Grid container spacing={4} alignItems="center">
              {[
                {
                  title: 'Effortless Fee Collection',
                  description:
                    'Automate invoicing and integrate Mpesa for real-time payments, reducing errors and delays by 95%.',
                  color: colors.accent,
                },
                {
                  title: 'Centralized Communication',
                  description:
                    'Engage parents and teachers with a unified platform, boosting communication by 80%.',
                  color: colors.secondary,
                },
                {
                  title: 'AI-Enhanced Teaching',
                  description:
                    'Save teachers 10+ hours weekly with CBC-aligned AI lesson plans.',
                  color: colors.secondary,
                },
              ].map(({ title, description, color }, index) => (
                <Grid 
                  item 
                  xs={12} 
                  md={4} 
                  key={title}
                  component={motion.div}
                  variants={itemVariants}
                >
                  <motion.div
                    whileHover={{ 
                      scale: 1.05,
                      transition: { duration: 0.3 }
                    }}
                  >
                    <Box
                      sx={{
                        borderRadius: '50%',
                        width: 200,
                        height: 200,
                        mx: 'auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: color,
                        textAlign: 'center',
                        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                        fontSize: { xs: '0.875rem', md: '1rem' }
                      }}
                    >
                      <Typography variant="h6" fontWeight="bold" color="#ffffff">
                        {title}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body1"
                      color="textSecondary"
                      sx={{ mt: 3, textAlign: 'center', fontSize: { xs: '0.875rem', md: '1rem' } }}
                    >
                      {description}
                    </Typography>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </AnimatedSection>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box
        sx={{
          background: `linear-gradient(to left, ${colors.background}, ${colors.primary})`,
          py: 10,
        }}
        id="testimonials"
      >
        <Container maxWidth="lg">
          <AnimatedSection
            title="Hear From Our Users"
            description="Real stories from schools transforming education with OneClickSMIS"
          >
            <TestimonialsCarousel />
          </AnimatedSection>
        </Container>
      </Box>
        
      {/* FAQ Section with Accordion Animations */}
      <Box sx={{ background: colors.background, py: 10 }} id="faq">
        <Container maxWidth="md">
          <AnimatedSection 
            title="Frequently Asked Questions"
            description="Get answers to common queries about OneClickSMIS"
          >
            {[
              {
                question: "Is OneClickSMIS secure?",
                answer: "Yes, we use industry-leading encryption and perform regular audits to ensure your data is safe."
              },
              {
                question: "Is it CBC compliant?",
                answer: "Absolutely! Our lesson plans are fully aligned with CBC requirements."
              },
              {
                question: "How does Mpesa/Bank integration work?",
                answer: "Payments are processed in real-time, automatically updating student fee records."
              },
              {
                question: "Is our data safe?",
                answer: " Absolutely. We use encrypted systems and adhere to strict privacy policies to protect your school’s information."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: index * 0.2,
                  duration: 0.5 
                }}
              >
                <Accordion 
                  sx={{ 
                    mt: 2,
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    '&:hover': {
                      transform: 'scale(1.02)',
                      transition: 'transform 0.3s ease'
                    }
                  }}
                >
                  <AccordionSummary 
                    expandIcon={<ExpandMoreIcon sx={{ color: colors.accent }} />}
                    sx={{ 
                      '& .MuiAccordionSummary-content': {
                        color: colors.accent
                      }
                    }}
                  >
                    <Typography variant="h6" sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>{faq.question}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography color={colors.textSecondary} sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>{faq.answer}</Typography>
                  </AccordionDetails>
                </Accordion>
              </motion.div>
            ))}
          </AnimatedSection>
        </Container>
      </Box>

      {/* Call-to-Action Section */}
      <Box
        sx={{
          background: `linear-gradient(to bottom, ${colors.secondary}, ${colors.primary})`,
          color: colors.textPrimary,
          py: 8,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <AnimatedSection
            title="Ready to Transform Your School?"
            description="Join over 100+ schools already benefiting from OneClickSMIS."
          >
            <CTAForm />
          </AnimatedSection>
        </Container>
      </Box>
      {/* Footer */}
      <Box sx={{ background: colors.footerBg, color: colors.textPrimary, py: 4 }}>
        <Typography align="center" variant="body2">
          © 2024 OneClickSMIS. All rights reserved.
        </Typography>
      </Box>
    </>
  );
};

export default LandingPage;