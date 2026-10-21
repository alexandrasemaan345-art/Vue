const {createApp} = Vue;

createApp({
    data(){
        return{
            lessons: [
                {id: 1, subject:'Math', location:'Dubai Marina', price: 100, spaces: 5, icon:'fa-solid fa-calculator'},
                {id: 2, subject:'English', location:'JLT', price: 90, spaces: 5, icon:'fa-solid fa-book'},
                {id: 3, subject:'Science', location:'Downtown', price: 120, spaces: 5, icon:'fa-solid fa-flask'},
                {id: 4, subject:'Music', location:'Al Barsha', price: 80, spaces: 5, icon: 'fa-solid fa-music'},
                {id: 5, subject:'Art', location:'Jumeirah', price: 70, spaces: 5, icon:'fa-solid fa-palette'},
                {id: 6, subject:'Football', location:'Sports City', price: 60, spaces: 5, icon: 'fa-solid fa-futbol'},
                {id: 7, subject:'Coding', location:'Business Bay', price: 150, spaces: 5, icon:'fa-solid fa-code'},
                {id: 8, subject:'Swimming', location:'Palm Jumeirah', price: 110, spaces: 5, icon:'fa-solid fa-person-swimming'},
                {id: 9, subject:'Chess', location:'Deira', price: 50, spaces: 5, icon:'fa-solid fa-chess'},
                {id: 10, subject:'Drama', location:'Mirdif', price: 85, spaces: 5, icon:'fa-solid fa-masks-theater'}

                ],
                sortBy: 'subject',
                sortOrder:'asc',
                cart:[],
                showCart: false,
                name: '',
                phone: '',
                orderMessage: ''
        };
    },
    computed: {
        sortedLessons() {
            const key = this.sortBy;
            const dir = this.sortOrder === 'asc' ? 1: -1;
            return [...this.lessons].sort((a,b) => {
                if (typeof a[key] === 'number') {
                    return (a[key] - b[key]) * dir;
                }
                return a[key].localeCompare(b[key]) * dir;
            });
        },
        isNameValid(){
            return /^[A-Za-z ]+$/.test(this.name.trim());
        },
        isPhoneValid(){
            return /^[0-9]+$/.test(this.phone);
        },
        canCheckout(){
            return this.isNameValid && this.isPhoneValid && this.cart.length > 0;
        }
    },
    methods: {
        addToCart(lesson) {
            if (lesson.spaces > 0) {
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
                this.orderMessage = '';
            }
        },
        checkout() {
            if (!this.canCheckout) {
                return;
            }
            this.orderMessage = 'Thank you, ' + this.name.trim() + '! Your order has been submitted.';
            this.cart =[];
            this.name = '';
            this.phone = '';
        },
        getLesson(id) {
            return this.lessons.find(l => l.id === id);
        }
    }
}).mount('#app');