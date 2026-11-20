import { ArrowLeft, Clock, User, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import knowledgeData from "@/data/knowledge.json";
import { resolveKnowledgeImage } from "@/data/knowledgeAssets";

const ExploreKnowledge = () => {
  const { courses, books } = knowledgeData;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header with back button */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                Knowledge <span className="text-primary">Sharing</span>
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                Explore our comprehensive collection of courses and books
              </p>
            </div>
          </div>

          {/* Courses Section */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <BookOpen className="h-6 w-6 text-primary" />
              <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                Courses
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {courses.map((course) => (
                <Card key={course.id} className="interactive-card group border-0 shadow-elegant overflow-hidden">
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src={resolveKnowledgeImage(course.image)}
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  </div>
                  
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">
                      {course.title}
                    </h3>
                    
                    <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span className="line-clamp-1">{course.instructor}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{course.duration}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {course.topics.slice(0, 2).map((topic, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                      {course.topics.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{course.topics.length - 2} more
                        </Badge>
                      )}
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    >
                      Enroll Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Books Section */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <BookOpen className="h-6 w-6 text-primary" />
              <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                Books Collection
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {books.map((book) => (
                <Card key={book.id} className="interactive-card group border-0 shadow-elegant overflow-hidden">
                  <div className="aspect-[3/4] relative overflow-hidden">
                    <img 
                      src={resolveKnowledgeImage(book.image)}
                      alt={book.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2">
                        {book.title}
                      </h3>
                      <p className="text-white/80 text-xs line-clamp-1">
                        {book.author}
                      </p>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    >
                      Read More
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ExploreKnowledge;
