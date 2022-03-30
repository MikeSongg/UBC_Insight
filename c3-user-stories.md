Please edit this template and commit to the master branch for your user stories submission.   
Make sure to follow the *Role, Goal, Benefit* framework for the user stories and the *Given/When/Then* framework for the Definitions of Done! You can also refer to the examples DoDs in [C3 spec](https://sites.google.com/view/ubc-cpsc310-21w2-intro-to-se/project/checkpoint-3).

## User Story 1
As a student, I want to find the courses within a certain grade range and larger than a certain size (passed amount), 
so that I can take the course and expect to have a high score.

#### Definitions of Done(s)
Scenario 1: Find all courses in the grade range with a size limit.
Given: A database, a size (minimal amount of pass), a grade limit(minimal), a grade limit(maximal).
When: user inputs class size, minimal and maximal grade then clicks search button 
Then: the course with the highest average grade in the major if all values are valid 
		and not reached the 5000 course limit.

## User Story 2
As a student, I want to find the class with the highest pass amount in a certain subject in certain semester, 
so that I can take the popular class.

#### Definitions of Done(s)
Scenario 2: Find the most popular course
Given: A database, a subject, a semester.
When: user clicks search button
Then: Print a course with the most amount of passed students (accumulative among all sections) 
	in the given year and subject. 

## Others
You may provide any additional user stories + DoDs in this section for general TA feedback.  
Note: These will not be graded.
