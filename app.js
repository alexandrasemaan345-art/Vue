// Vue App Version 1.0
const {createApp} = Vue;

// localhost for testing
const API_URL = 'http://localhost:3000';

createApp({
    data(){
        return{
            lessons:[],
            sortBy: 'subject',
            sortOrder: 'asc',
            cart:[],
            showCart: false,
            name:'',
            phone:'',
            orderMessage:'',
            searchQuery: '',
            teachers: [],
            selectedTeacherId: '',
            bookingDate: ''
        };
    },
    mounted(){
        // Fetch lessons
        fetch(`${API_URL}/lessons`)
        .then(response => response.json())
        .then(data => {
            this.lessons = data.map(lesson => ({
                ...lesson,
                id: lesson._id
            }));
        })
        .catch(error => console.error("Error fetching lessons:", error));

        // Fetch teachers
        fetch(`${API_URL}/teachers`)
        .then(res => res.json())
        .then(data => {
            this.teachers = data;
        })
        .catch(error => console.error("Error fetching teachers:", error));
    },
    computed: {
        sortedLessons() {
            const key = this.sortBy;
            const dir = this.sortOrder === 'asc' ? 1: -1;
            return [...this.lessons].sort((a,b)=> {
                if(typeof a[key]=== 'number'){
                    return (a[key] - b[key]) * dir;
                }
                return a[key].localeCompare(b[key]) * dir;
            });
        },
        isNameValid()  {
            return /^[A-Za-z ]+$/.test(this.name.trim());
        },
        isPhoneValid() {
            return /^[0-9]+$/.test(this.phone);
        },
        canCheckout() {
            return this.isNameValid && this.isPhoneValid && this.cart.length > 0;
        }
    },
    methods: {
        addToCart(lesson) {
            if (lesson.spaces > 0){
                lesson.spaces--;
                this.cart.push(lesson.id);
            }
        },
        removeFromCart(index) {
            const lessonId = this.cart[index];
            const lesson = this.lessons.find(l => l.id === lessonId);
            lesson.spaces++;
            this.cart.splice(index, 1);
        },
        toggleCart() {
            this.showCart = !this.showCart;
            if (!this.showCart){
                this.orderMessage ='';
            }
        },
        searchLessons() {
            if (this.searchQuery.trim()===''){
                fetch(`${API_URL}/lessons`)
                .then(res => res.json())
                .then(data => {
                    this.lessons = data.map(l => ({ ...l, id: l._id}));
                });
                return;
            }
            fetch(`${API_URL}/search?q=${this.searchQuery}`)
            .then(res => {
                if (!res.ok) throw new Error ("Search failed");
                return res.json();
            })
            .then(data => {
                this.lessons = data.map(l => ({...l, id:l._id}));
            })
            .catch(error =>{
                console.error("Search Error:", error);
            });
        },
        filterByTeacher() {
            if(this.selectedTeacherId === '') {
                // If "All Teachers" is selected, fecth all lessons
                fetch(`${API_URL}/lessons`)
                .then(res => res.json())
                .then(data => {
                    this.lessons = data.map(l => ({ ...l, id: l._id}));
                })
                .catch(err => console.error("Error fetching all lessons:", err));
            } else {
                // Fetch lessons for the selected teacher
                fetch(`${API_URL}/teachers/${this.selectedTeacherId}/lessons`)
                .then(res => {
                    if (!res.ok) throw new Error("Failed to fetch teacher lessons");
                    return res.json();
                })
                .then(data => {
                    console.log("Teacher lessons received:", data);

                    this.lessons = data.map(l => ({ ...l, id: l._id }));
                })
                .catch(err => console.error("Error filtering by teacher:", err));
            }    
               
        },
        checkout() {
            if (!this.canCheckout || !this.bookingDate) return;

            const orderData = {
                name: this.name.trim(),
                phone: this.phone,
                lessonIds: this.cart,
                spaces: this.cart.length,
                bookingDate: this.bookingDate
            };
            fetch(`${API_URL}/orders`,{
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(orderData)
            })
            .then(response => {
                if(!response.ok) throw new Error("Order failed");
                return response.json();
            })
            .then(() => {
                // Update spaces in the database for each lesson purchased
                this.cart.forEach(lessonId => {
                    const lesson = this.lessons.find(l => l.id === lessonId);
                    if (lesson) {
                        fetch(`${API_URL}/lesson/${lessonId}`,{
                            method: 'PUT',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({ spaces: lesson.spaces})
                        }).catch(err => console.error("Error updating space:", err));
                    }
                });
                
                // Show success message and clear cart
                this.orderMessage = 'Thank you, ' + this.name + '! Your order has been submitted';
                this.cart = [];
                this.name = '';
                this.phone = '';
                this.bookingDate = '';
            })
            .catch(error => {
                console.error("Error submitting order:", error);
                alert("There was an error submitting your order.");
            });
        },
        getLesson(id){
            return this.lessons.find(l => l.id === id);
        }
    }
}).mount('#app');