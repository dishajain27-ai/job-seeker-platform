const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');

const seedMockSeekersAndApplications = async () => {
  try {
    const mockSeekersInfo = [
      {
        name: 'Aarav Sharma',
        email: 'aarav.sharma@gmail.com',
        password: 'password123',
        role: 'seeker',
        title: 'Full Stack Developer',
        skills: ['REACT', 'NODE.JS', 'EXPRESS', 'MONGODB', 'JAVASCRIPT'],
        summary: 'Passionate Full Stack Developer with 2+ years of hands-on experience building responsive web applications and backend microservices.'
      },
      {
        name: 'Neha Gupta',
        email: 'neha.gupta@outlook.com',
        password: 'password123',
        role: 'seeker',
        title: 'Frontend Engineer',
        skills: ['REACT', 'TYPESCRIPT', 'TAILWIND CSS', 'REDUX', 'HTML/CSS'],
        summary: 'Frontend Engineer focused on creating pixel-perfect, highly accessible user interfaces with React and modern CSS systems.'
      },
      {
        name: 'Dev Patel',
        email: 'dev.patel@yahoo.com',
        password: 'password123',
        role: 'seeker',
        title: 'Python Software Developer',
        skills: ['PYTHON', 'DJANGO', 'FLASK', 'SQL', 'POSTGRESQL'],
        summary: 'Backend software developer specializing in Python, data analysis pipelines, and developing robust RESTful APIs.'
      }
    ];

    const seededJobs = await Job.find({});
    if (seededJobs.length === 0) {
      console.log('No jobs found to attach applications to. Seeker applications seeding deferred.');
      return;
    }

    for (const seekerData of mockSeekersInfo) {
      let seeker = await User.findOne({ email: seekerData.email });
      if (!seeker) {
        seeker = await User.create({
          name: seekerData.name,
          email: seekerData.email,
          password: seekerData.password,
          role: seekerData.role
        });
        console.log(`Mock seeker created: ${seeker.email}`);
      }

      // Check if application exists
      const appExists = await Application.findOne({ seeker: seeker._id });
      if (!appExists) {
        // Find a suitable job to apply to (e.g. match title keywords)
        const job = seededJobs.find(j => 
          j.title.toLowerCase().includes(seekerData.title.split(' ')[0].toLowerCase())
        ) || seededJobs[Math.floor(Math.random() * seededJobs.length)];
        
        if (job) {
          await Application.create({
            job: job._id,
            seeker: seeker._id,
            fullName: seeker.name,
            email: seeker.email,
            phone: '+91 98765 43210',
            resumePath: 'uploads/resume-1780649459959-340131281.pdf', // reuse existing file in uploads
            coverLetter: seekerData.summary,
            matchScore: Math.floor(Math.random() * 20) + 75,
            status: 'pending'
          });
          console.log(`Mock application created for ${seeker.email} on job "${job.title}"`);
        }
      }
    }
  } catch (err) {
    console.error('Error seeding mock seekers and applications:', err.message);
  }
};

const seedDatabase = async () => {
  try {
    // Force refresh/reseeding to standardize the salary formatting
    console.log('Refreshing mock jobs with standardized salary formats...');
    await Job.deleteMany({});
    await Application.deleteMany({});

    console.log('Seeding database with mock data...');

    // Find or create default employer
    let employer = await User.findOne({ email: 'employer@talenthub.com' });
    if (!employer) {
      employer = await User.create({
        name: 'TalentHub Admin Employer',
        email: 'employer@talenthub.com',
        password: 'password123',
        role: 'employer'
      });
      console.log('Default employer user created: employer@talenthub.com');
    }

    const mockJobs = [
      {
        title: 'Software Engineer Intern',
        company: 'Acro Tech Solutions',
        description: 'We are looking for a Software Engineering Intern to join our development team in Delhi. You will work on building scalable web interfaces using React and Node.js. This is a great opportunity to learn from experienced developers and work on live projects.',
        location: 'Delhi',
        type: 'Internship',
        salary: '₹2,40,000 - ₹4,20,000 / year',
        requirements: ['React.js', 'JavaScript', 'HTML/CSS', 'Git', 'Problem Solving'],
        address: '402 Saket Metro Station Road, Saket, New Delhi',
        coordinates: { lat: 28.5222, lng: 77.2066 },
        hotline: '+91 11 4059 8721',
        employer: employer._id
      },
      {
        title: 'Web Development & Software Intern',
        company: 'TechPyramid India',
        description: 'We are seeking a Frontend / Web Development & Software Intern for our Delhi office. You will work on designing responsive web landing pages and software interfaces using HTML, CSS, JavaScript, and Tailwind. This internship offers hands-on experience and a stipend.',
        location: 'Delhi',
        type: 'Internship',
        salary: '₹2,16,000 - ₹3,00,000 / year',
        requirements: ['HTML', 'CSS', 'JavaScript', 'Tailwind CSS', 'Bootstrap'],
        address: 'Plot 12, Phase III, Okhla Industrial Area, New Delhi',
        coordinates: { lat: 28.5355, lng: 77.2711 },
        hotline: '+91 11 2681 4030',
        employer: employer._id
      },
      {
        title: 'Python Software Developer Intern',
        company: 'ByteCraft Labs',
        description: 'Join us as a Python backend software developer intern in Delhi. Assist in writing clean APIs using Django or Flask, and integrate database schemas with PostgreSQL.',
        location: 'Delhi',
        type: 'Internship',
        salary: '₹2,64,000 - ₹3,60,000 / year',
        requirements: ['Python', 'Django/Flask', 'SQL', 'Git'],
        address: 'E-55, Connaught Place, Outer Circle, New Delhi',
        coordinates: { lat: 28.6304, lng: 77.2177 },
        hotline: '+91 11 4152 3891',
        employer: employer._id
      },
      {
        title: 'Associate Software Engineer',
        company: 'Wipro Technologies',
        description: 'Wipro is seeking an Associate Software Engineer in Delhi. Work on cloud applications, write unit tests, and collaborate on software deployment plans.',
        location: 'Delhi',
        type: 'Full-time',
        salary: '₹5,00,000 - ₹7,00,000 / year',
        requirements: ['Java', 'Spring Boot', 'SQL', 'Git'],
        address: 'Building 1A, DLF Cyber City, Phase III, Gurgaon, Delhi NCR',
        coordinates: { lat: 28.4901, lng: 77.0898 },
        hotline: '+91 124 4021 9888',
        employer: employer._id
      },
      {
        title: 'Software Engineering Intern - Frontend',
        company: 'Paytm Payments',
        description: 'Exciting frontend software engineering internship in Delhi. Work on web interfaces using React.js and Tailwind CSS.',
        location: 'Delhi',
        type: 'Internship',
        salary: '₹3,00,000 - ₹4,20,000 / year',
        requirements: ['React.js', 'JavaScript', 'CSS', 'Git'],
        address: 'Metro Station gate 2, Karol Bagh, New Delhi',
        coordinates: { lat: 28.6433, lng: 77.1912 },
        hotline: '+91 11 2875 1902',
        employer: employer._id
      },
      {
        title: 'Data Analyst Intern',
        company: 'Innovo Analytics',
        description: 'Analyze large datasets to extract actionable insights. Collaborate with product managers to guide feature development.',
        location: 'Delhi',
        type: 'Internship',
        salary: '₹1,80,000 - ₹3,00,000 / year',
        requirements: ['Python', 'SQL', 'Excel', 'Data Visualization', 'Communication'],
        address: 'B-Block, Sector 62, Noida, Delhi NCR',
        coordinates: { lat: 28.6272, lng: 77.3725 },
        hotline: '+91 120 4051 0392',
        employer: employer._id
      },
      {
        title: 'Junior Data Analyst',
        company: 'InfoSys Analytics',
        description: 'We are hiring a Junior Data Analyst for our Delhi branch. You will assist in extracting, cleaning, and visualizing business data to support decision-making.',
        location: 'Delhi',
        type: 'Full-time',
        salary: '₹4,00,000 - ₹6,05,000 / year',
        requirements: ['SQL', 'Excel', 'Tableau', 'Data Analysis'],
        address: 'Lajpat Nagar II, Alankar Cinema Road, New Delhi',
        coordinates: { lat: 28.5701, lng: 77.2415 },
        hotline: '+91 11 4652 0910',
        employer: employer._id
      },
      {
        title: 'Data Analyst - Product Operations',
        company: 'Zomato Careers',
        description: 'Join our product operations team in Delhi. Clean and analyze application logs and transactional data using Python and SQL to uncover trends in user behavior.',
        location: 'Delhi',
        type: 'Full-time',
        salary: '₹8,00,000 - ₹12,00,000 / year',
        requirements: ['Python', 'SQL', 'Excel', 'Product Analytics'],
        address: 'H-30, Hauz Khas Enclave, New Delhi',
        coordinates: { lat: 28.5488, lng: 77.2052 },
        hotline: '+91 11 4015 9025',
        employer: employer._id
      },
      {
        title: 'Marketing Data Analyst',
        company: 'Delhi Media Group',
        description: 'We are seeking a Marketing Data Analyst to track campaign metrics, CTR, conversion rates, and ROI. Work with our marketing team in Delhi.',
        location: 'Delhi',
        type: 'Contract',
        salary: '₹4,20,000 - ₹6,00,000 / year',
        requirements: ['Google Analytics', 'SQL', 'Excel', 'Data Visualization'],
        address: 'District Centre, Janakpuri, New Delhi',
        coordinates: { lat: 28.6288, lng: 77.0788 },
        hotline: '+91 11 2555 1802',
        employer: employer._id
      },
      {
        title: 'Data Science & Analyst Intern',
        company: 'Hindustan Tech',
        description: 'Data Science & Analytics Intern position open in Delhi. Help clean datasets, run descriptive statistical models, and draft reports using Python.',
        location: 'Delhi',
        type: 'Internship',
        salary: '₹2,16,000 - ₹3,00,000 / year',
        requirements: ['Python', 'Pandas', 'Matplotlib', 'SQL'],
        address: 'Sector 18, Block C, Noida, Delhi NCR',
        coordinates: { lat: 28.5705, lng: 77.3262 },
        hotline: '+91 120 4567 1221',
        employer: employer._id
      },
      {
        title: 'Full Stack Developer',
        company: 'TalentHub Corp',
        description: 'Looking for an experienced Full Stack Developer to manage our web infrastructure. You will collaborate closely with UI designers and backend engineers to deploy clean code.',
        location: 'Remote',
        type: 'Full-time',
        salary: '₹90,00,000 - ₹1,15,00,005 / year',
        requirements: ['React.js', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS'],
        address: 'Silicon Valley Tower, remote branch, San Francisco, CA',
        coordinates: { lat: 37.7749, lng: -122.4194 },
        hotline: '+1 415 555 0199',
        employer: employer._id
      },
      {
        title: 'UI/UX Designer',
        company: 'CreativeStudio',
        description: 'Join our design studio and build modern user interfaces. Create high-fidelity wireframes and design system components.',
        location: 'Delhi',
        type: 'Contract',
        salary: '₹4,80,000 - ₹7,20,000 / year',
        requirements: ['Figma', 'Adobe XD', 'User Research', 'Wireframing'],
        address: 'Shahpur Jat Development Area, New Delhi',
        coordinates: { lat: 28.5491, lng: 77.2122 },
        hotline: '+91 11 4102 3090',
        employer: employer._id
      },
      {
        title: 'Frontend Engineer',
        company: 'WebFlow Tech',
        description: 'Develop high performance frontend user interfaces. Work with Vite, React, and Tailwind CSS.',
        location: 'Mumbai',
        type: 'Full-time',
        salary: '₹8,00,000 - ₹12,00,000 / year',
        requirements: ['React.js', 'Tailwind CSS', 'JavaScript', 'Webpack/Vite'],
        address: 'Bandra Kurla Complex, G-Block, Mumbai',
        coordinates: { lat: 19.0607, lng: 72.8634 },
        hotline: '+91 22 6112 4000',
        employer: employer._id
      },
      {
        title: 'Cloud DevOps Engineer',
        company: 'CloudScale Systems',
        description: 'Implement CI/CD automation pipelines, manage AWS infrastructure assets, configure Docker and Kubernetes containers.',
        location: 'Bangalore',
        type: 'Full-time',
        salary: '₹12,00,000 - ₹18,00,000 / year',
        requirements: ['AWS', 'Docker', 'Kubernetes', 'CI/CD Pipelines', 'Linux'],
        address: 'Prestige Tech Park, Outer Ring Road, Bangalore',
        coordinates: { lat: 12.9352, lng: 77.6938 },
        hotline: '+91 80 4001 9200',
        employer: employer._id
      },
      {
        title: 'Backend Developer (Node/Go)',
        company: 'TechPioneers',
        description: 'Write robust backend service APIs in Node.js and Go. Ensure database queries are optimized and secure.',
        location: 'Gurgaon',
        type: 'Full-time',
        salary: '₹10,00,000 - ₹14,00,000 / year',
        requirements: ['Node.js', 'Go / Golang', 'PostgreSQL', 'Redis', 'REST API'],
        address: 'Udyog Vihar Phase IV, Gurgaon, Delhi NCR',
        coordinates: { lat: 28.4988, lng: 77.0812 },
        hotline: '+91 124 4901 8292',
        employer: employer._id
      },
      {
        title: 'Android App Developer Intern',
        company: 'AppForge Solutions',
        description: 'Collaborate with our mobile developers in Noida to design and deploy Android applications using Kotlin.',
        location: 'Noida',
        type: 'Internship',
        salary: '₹1,80,000 - ₹2,64,000 / year',
        requirements: ['Android Studio', 'Kotlin', 'XML', 'API Integration'],
        address: 'Sector 63, Block H, Noida, Delhi NCR',
        coordinates: { lat: 28.6301, lng: 77.3815 },
        hotline: '+91 120 4912 3000',
        employer: employer._id
      },
      {
        title: 'Data Scientist',
        company: 'DataMinds Group',
        description: 'Build predictive machine learning models and handle complex analytics. Work closely with product managers.',
        location: 'Bangalore',
        type: 'Full-time',
        salary: '₹14,00,000 - ₹20,00,000 / year',
        requirements: ['Python', 'Pandas', 'Scikit-Learn', 'TensorFlow', 'Machine Learning'],
        address: 'Manyata Tech Park, Hebbal, Bangalore',
        coordinates: { lat: 13.0452, lng: 77.6205 },
        hotline: '+91 80 6601 5000',
        employer: employer._id
      },
      {
        title: 'Quality Assurance Intern',
        company: 'QA-Bots',
        description: 'Develop automation test scripts and perform manual sanity checks. Assist in locating defects.',
        location: 'Gurgaon',
        type: 'Internship',
        salary: '₹12,00,000 - ₹18,00,000 / year',
        requirements: ['Selenium', 'Java', 'Manual Testing', 'Bug Reporting'],
        address: 'Sector 32, Institutional Area, Gurgaon, Delhi NCR',
        coordinates: { lat: 28.4552, lng: 77.0452 },
        hotline: '+91 124 4812 9100',
        employer: employer._id
      },
      {
        title: 'Product Manager',
        company: 'Productive Solutions',
        description: 'Define product roadmaps, coordinate cross-functional teams, and gather detailed requirements.',
        location: 'Remote',
        type: 'Full-time',
        salary: '₹75,00,000 - ₹1,00,00,000 / year',
        requirements: ['Product Roadmap', 'Agile / Scrum', 'Jira', 'UI UX concepts'],
        address: 'Broadway Plaza corporate hub, Remote, New York, NY',
        coordinates: { lat: 40.7128, lng: -74.0060 },
        hotline: '+1 212 555 0150',
        employer: employer._id
      },
      {
        title: 'React Native Developer',
        company: 'MobileFirst Systems',
        description: 'Build cross-platform iOS and Android apps using React Native. Integrate push notifications and native SDKs.',
        location: 'Delhi',
        type: 'Contract',
        salary: '₹6,00,000 - ₹9,00,000 / year',
        requirements: ['React Native', 'TypeScript', 'Redux', 'iOS/Android Deployment'],
        address: 'Connaught Place, Regal Building, New Delhi',
        coordinates: { lat: 28.6291, lng: 77.2144 },
        hotline: '+91 11 4151 2900',
        employer: employer._id
      },
      {
        title: 'Machine Learning Engineer',
        company: 'AI Labs India',
        description: 'Research, build, and deploy AI models. Optimize algorithms for production scale.',
        location: 'Hyderabad',
        type: 'Full-time',
        salary: '₹15,00,000 - ₹22,00,000 / year',
        requirements: ['Python', 'PyTorch', 'Numpy', 'MLOps', 'Deep Learning'],
        address: 'HITEC City, Phase II, Hyderabad',
        coordinates: { lat: 17.4483, lng: 78.3741 },
        hotline: '+91 40 4000 6600',
        employer: employer._id
      },
      {
        title: 'Systems Architect',
        company: 'EnterpriseCorp',
        description: 'Plan systems architecture, microservices layout, and cloud migration strategies.',
        location: 'Pune',
        type: 'Full-time',
        salary: '₹22,00,000 - ₹32,00,000 / year',
        requirements: ['System Design', 'Microservices', 'Kubernetes', 'Enterprise Security'],
        address: 'Eon IT Park, Kharadi, Pune',
        coordinates: { lat: 18.5521, lng: 73.9515 },
        hotline: '+91 20 6600 1200',
        employer: employer._id
      },
      {
        title: 'Cyber Security Analyst',
        company: 'SecureNet Ltd',
        description: 'Monitor network systems for threats, configure firewalls, and perform penetration tests.',
        location: 'Delhi',
        type: 'Full-time',
        salary: '₹8,00,000 - ₹12,00,000 / year',
        requirements: ['Network Security', 'Ethical Hacking', 'Linux', 'Security Auditing'],
        address: 'Rajendra Place, Tower B, New Delhi',
        coordinates: { lat: 28.6418, lng: 77.1775 },
        hotline: '+91 11 2571 8900',
        employer: employer._id
      },
      {
        title: 'Tech Lead',
        company: 'InnovateSoft',
        description: 'Lead a team of 6 engineers, establish coding best practices, and architect core modules.',
        location: 'Bangalore',
        type: 'Full-time',
        salary: '₹25,00,000 - ₹35,00,000 / year',
        requirements: ['Team Leadership', 'Architecture Design', 'Node.js/React', 'Agile'],
        address: 'Whitefield Main Road, ITPB, Bangalore',
        coordinates: { lat: 12.9845, lng: 77.7475 },
        hotline: '+91 80 2800 3500',
        employer: employer._id
      },
      {
        title: 'Technical Writer',
        company: 'DocsInc',
        description: 'Compose developer documentation, API guides, and reference papers.',
        location: 'Remote',
        type: 'Part-time',
        salary: '₹6,00,000 - ₹10,00,000 / year',
        requirements: ['Markdown', 'API Documentation', 'Git', 'Writing Samples'],
        address: 'TechDocs remote HQ, Austin, TX',
        coordinates: { lat: 30.2672, lng: -97.7431 },
        hotline: '+1 512 555 0122',
        employer: employer._id
      },
      {
        title: 'SQL Database Administrator',
        company: 'DB-Optima',
        description: 'Optimize queries, perform data backups, configure replica sets, and handle index setups.',
        location: 'Noida',
        type: 'Full-time',
        salary: '₹9,00,000 - ₹13,00,000 / year',
        requirements: ['MS SQL Server', 'Performance Tuning', 'T-SQL', 'Backup Recovery'],
        address: 'Noida Expressway Sector 127, Noida, Delhi NCR',
        coordinates: { lat: 28.5360, lng: 77.3452 },
        hotline: '+91 120 4012 3990',
        employer: employer._id
      },
      {
        title: 'PHP/WordPress Developer Intern',
        company: 'WebStyles',
        description: 'Work on customizing WordPress themes and PHP backend setups in our Delhi office.',
        location: 'Delhi',
        type: 'Internship',
        salary: '₹1,44,000 - ₹2,16,000 / year',
        requirements: ['PHP', 'HTML/CSS', 'WordPress', 'MySQL'],
        address: 'Nehru Place, Devika Tower, New Delhi',
        coordinates: { lat: 28.5495, lng: 77.2520 },
        hotline: '+91 11 2641 4800',
        employer: employer._id
      },
      {
        title: 'Scrum Master',
        company: 'AgileMinds Consulting',
        description: 'Facilitate sprint planning, daily standups, and retrospective meetings for engineering teams.',
        location: 'Pune',
        type: 'Part-time',
        salary: '₹4,20,000 - ₹6,00,000 / year',
        requirements: ['Scrum Alliance cert', 'Agile Coaching', 'Jira', 'Conflict Resolution'],
        address: 'Hinjewadi Phase 1, Rajiv Gandhi Infotech Park, Pune',
        coordinates: { lat: 18.5912, lng: 73.7405 },
        hotline: '+91 20 4912 5500',
        employer: employer._id
      },
      {
        title: 'Frontend Developer Intern',
        company: 'ReactGeeks Studio',
        description: 'Develop high fidelity React UI layouts in Delhi. Work with Tailwind CSS and Redux.',
        location: 'Delhi',
        type: 'Internship',
        salary: '₹1,80,000 - ₹2,64,000 / year',
        requirements: ['React.js', 'Redux / Zustand', 'CSS Modules', 'Tailwind'],
        address: 'Dwarka Sector 10, Metro Mall Complex, New Delhi',
        coordinates: { lat: 28.5815, lng: 77.0601 },
        hotline: '+91 11 4902 3550',
        employer: employer._id
      },
      {
        title: 'Python Django Developer',
        company: 'PySolutions Inc',
        description: 'Build backend dashboard APIs and handle data integrations using Python, Django, and Django REST Framework.',
        location: 'Bangalore',
        type: 'Full-time',
        salary: '₹10,00,000 - ₹15,00,000 / year',
        requirements: ['Python', 'Django', 'Django REST Framework', 'Celery / Redis'],
        address: 'Electronic City Phase 1, Tech Avenue, Bangalore',
        coordinates: { lat: 12.8452, lng: 77.6601 },
        hotline: '+91 80 4912 8000',
        employer: employer._id
      },
      {
        title: 'JavaScript Developer',
        company: 'NodeExpress Solutions',
        description: 'Deliver serverless Node.js backend functions, handle security patches, and configure auth flows.',
        location: 'Remote',
        type: 'Contract',
        salary: '₹12,00,000 - ₹16,00,000 / year',
        requirements: ['JavaScript ES6+', 'AWS Lambda', 'Node.js', 'NoSQL Datastores'],
        address: 'Remote Developer Network, London, UK',
        coordinates: { lat: 51.5074, lng: -0.1278 },
        hotline: '+44 20 7946 0192',
        employer: employer._id
      }
    ];

    await Job.insertMany(mockJobs);
    console.log(`Successfully seeded ${mockJobs.length} mock jobs into the database!`);

    // Seed mock seekers & applications after inserting jobs
    await seedMockSeekersAndApplications();
  } catch (error) {
    console.error('Error seeding database:', error.message);
  }
};

module.exports = seedDatabase;
