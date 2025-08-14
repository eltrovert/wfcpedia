# Components

## Core Component Architecture

```typescript
// Bottom Navigation - 60px height, thumb-zone optimized
const BottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: HomeIcon, label: 'Discover', route: '/', key: 'discover' },
    { icon: FilterIcon, label: 'Filter', route: '/filter', key: 'filter' },
    { icon: PlusIcon, label: 'Add Café', route: '/add', key: 'add' },
    { icon: BookIcon, label: 'Journal', route: '/journal', key: 'journal' },
    { icon: UsersIcon, label: 'Community', route: '/community', key: 'community' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-15 bg-white border-t border-gray-200 z-50">
      <div className="flex h-full">
        {navItems.map(item => (
          <TouchTarget
            key={item.key}
            className="flex-1 flex flex-col items-center justify-center min-h-11 min-w-11"
            onClick={() => navigate(item.route)}
            aria-label={item.label}
          >
            <item.icon className={`w-6 h-6 ${
              location.pathname === item.route ? 'text-primary' : 'text-gray-500'
            }`} />
            <span className="text-xs mt-1">{item.label}</span>
          </TouchTarget>
        ))}
      </div>
    </nav>
  );
};

// Café Card - 16:9 aspect ratio, overlay info, touch actions
const CafeCard: React.FC<{ cafe: Cafe }> = ({ cafe }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [loved, setLoved] = useState(false);

  const handleLove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoved(!loved);
    await cafeService.toggleLove(cafe.id);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      await navigator.share({
        title: cafe.name,
        text: `Check out ${cafe.name} on WFC-Pedia`,
        url: `/cafe/${cafe.id}`
      });
    }
  };

  return (
    <TouchTarget
      className="relative bg-white rounded-lg overflow-hidden shadow-sm mb-3"
      onClick={() => navigate(`/cafe/${cafe.id}`)}
      aria-label={`View details for ${cafe.name}`}
    >
      <div className="aspect-video relative">
        <ProgressiveImage
          src={cafe.images[0]?.url}
          thumbnailSrc={cafe.images[0]?.thumbnailUrl}
          alt={cafe.name}
          className="w-full h-full object-cover"
          onLoad={() => setImageLoaded(true)}
        />

        {/* Overlay Info */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
          <div className="absolute bottom-4 left-4 right-16 text-white">
            <h3 className="font-semibold text-lg leading-tight drop-shadow">
              {cafe.name}
            </h3>
            <p className="text-sm opacity-90 drop-shadow">
              {cafe.location.district}, {cafe.location.city}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <WifiIcon className="w-4 h-4" />
              <span className="text-xs">{cafe.workMetrics.wifiSpeed}</span>
              <StarRating rating={cafe.workMetrics.comfortRating} size="sm" />
              <HeartIcon className="w-4 h-4 ml-1" />
              <span className="text-xs">{cafe.community.loveCount}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <TouchTarget
            className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center"
            onClick={handleLove}
            aria-label={loved ? 'Remove from favorites' : 'Add to favorites'}
          >
            <HeartIcon className={`w-5 h-5 ${loved ? 'text-red-500 fill-current' : 'text-white'}`} />
          </TouchTarget>

          <TouchTarget
            className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center"
            onClick={handleShare}
            aria-label="Share café"
          >
            <ShareIcon className="w-5 h-5 text-white" />
          </TouchTarget>
        </div>
      </div>
    </TouchTarget>
  );
};

// Café Gallery - Masonry grid, infinite scroll, pull-to-refresh
const CafeGallery: React.FC = () => {
  const {
    data: cafes,
    fetchNextPage,
    hasNextPage,
    isLoading,
    refetch
  } = useInfiniteQuery(['cafes'], fetchCafes, {
    getNextPageParam: (lastPage) => lastPage.nextCursor
  });

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <div className="px-4 pb-20">
      <PullToRefresh onRefresh={handleRefresh} refreshing={refreshing}>
        <InfiniteScroll
          hasMore={hasNextPage}
          loadMore={fetchNextPage}
          loader={<CafeCardSkeleton />}
        >
          <div className="grid grid-cols-1 gap-3">
            {cafes?.pages.flatMap(page => page.cafes).map(cafe => (
              <CafeCard key={cafe.id} cafe={cafe} />
            ))}
          </div>
        </InfiniteScroll>
      </PullToRefresh>

      {isLoading && (
        <div className="grid grid-cols-1 gap-3">
          {Array(6).fill(0).map((_, i) => (
            <CafeCardSkeleton key={i} />
          ))}
        </div>
      )}
    </div>
  );
};

// Touch-Optimized Base Component
const TouchTarget: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  'aria-label'?: string;
}> = ({ children, className = '', onClick, 'aria-label': ariaLabel }) => {
  return (
    <button
      className={`min-h-11 min-w-11 flex items-center justify-center touch-manipulation ${className}`}
      onClick={onClick}
      aria-label={ariaLabel}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {children}
    </button>
  );
};
```

---
