export const sampleTasks = [
  {
    title: "Complete Calculus Problem Set #5 (Derivatives & Integrals)",
    subject: "Mathematics",
    due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
    priority: "High",
    completed: false
  },
  {
    title: "Write Introduction & Methodology for Chemistry Lab Report",
    subject: "Chemistry",
    due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // In 3 days
    priority: "High",
    completed: false
  },
  {
    title: "Read Chapters 7-9 of 'Modern World History' & prepare notes",
    subject: "History",
    due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // In 5 days
    priority: "Medium",
    completed: false
  },
  {
    title: "Implement Binary Search Tree algorithm in Java",
    subject: "Computer Science",
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // In 7 days
    priority: "Medium",
    completed: false
  },
  {
    title: "Review Spanish Vocabulary Flashcards (Units 1-4)",
    subject: "Spanish",
    due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Yesterday (done)
    priority: "Low",
    completed: true
  },
  {
    title: "Submit Physics Quiz 3 on Newtonian Mechanics",
    subject: "Physics",
    due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days ago (done)
    priority: "High",
    completed: true
  }
];
